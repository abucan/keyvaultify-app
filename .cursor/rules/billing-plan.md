````markdown
---
globs: **/*.ts,**/*.tsx

---

# Billing Plan Implementation for Next.js v15 SaaS

## Overview

Implement free, monthly, yearly (with discount), and lifetime subscription tiers with team access levels. Use Stripe for payments and BetterAuth for session management. Focus on security and scalability.

## Database Schema

Update `db/schema.ts` with new tables:

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

export const users = sqliteTable('users', {
  id: text('id').primaryKey()
  // ... existing fields
})

export const subscriptions = sqliteTable('subscriptions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('userId')
    .notNull()
    .references(() => users.id),
  plan: text('plan', {
    enum: ['free', 'monthly', 'yearly', 'lifetime']
  }).notNull(),
  teamSize: integer('teamSize').default(1), // -1 for unlimited (lifetime)
  status: text('status', { enum: ['active', 'inactive'] }).default('active'),
  paymentId: text('paymentId'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(new Date())
})

export const teams = sqliteTable('teams', {
  id: text('id').primaryKey(), // Default team ID = userId on signup
  name: text('name').notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(new Date())
})

export const team_members = sqliteTable('team_members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  teamId: text('teamId')
    .notNull()
    .references(() => teams.id),
  userId: text('userId')
    .notNull()
    .references(() => users.id),
  role: text('role', { enum: ['owner', 'member'] }).default('member')
})
```
````

## Server Actions

Create `actions/billing.ts`:

```typescript
'use server'

import { auth } from '@/lib/auth'
import { db } from '@/db'
import { subscriptions, teams, team_members } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { unauthorized } from 'next/navigation'
import Stripe from 'stripe'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export async function updateSubscription(
  plan: 'free' | 'monthly' | 'yearly' | 'lifetime'
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) unauthorized()

  const userId = session.user.id
  let teamSize = 1 // Free
  if (plan === 'monthly' || plan === 'yearly') teamSize = 5
  if (plan === 'lifetime') teamSize = -1 // Unlimited

  let paymentId: string | null = null
  if (plan !== 'free') {
    const priceId =
      plan === 'yearly'
        ? process.env.STRIPE_YEARLY_PRICE_ID
        : plan === 'monthly'
          ? process.env.STRIPE_MONTHLY_PRICE_ID
          : process.env.STRIPE_LIFETIME_PRICE_ID
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: plan === 'lifetime' ? 'payment' : 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_URL}/settings/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/settings/billing?canceled=true`
    })
    paymentId = session.id // Store Stripe session ID temporarily
  }

  await db
    .update(subscriptions)
    .set({ plan, teamSize, paymentId, status: 'active' })
    .where(eq(subscriptions.userId, userId))
    .onConflictDoUpdate({
      target: subscriptions.userId,
      set: { plan, teamSize, paymentId, status: 'active' }
    })

  redirect('/settings/billing')
}

export async function addTeamMember(email: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) unauthorized()

  const userId = session.user.id
  const subscription = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .get()

  if (!subscription || subscription.teamSize === 0) unauthorized()
  if (
    subscription.teamSize > 0 &&
    subscription.teamSize <=
      (
        await db
          .select({ count: sql`count(*)` })
          .from(team_members)
          .where(eq(team_members.teamId, userId))
          .get()
      ).count
  ) {
    throw new Error('Team limit reached')
  }

  // Invite logic (e.g., email via BetterAuth)
  await db
    .insert(team_members)
    .values({ teamId: userId, userId: userId, email, role: 'member' })
}
```

## Middleware

Update `middleware.ts` for access control:

```typescript
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { subscriptions } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function middleware(request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return unauthorized()

  const userId = session.user.id
  const subscription = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .get()

  const protectedRoutes = ['/dashboard', '/team']
  if (
    protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))
  ) {
    if (!subscription || subscription.status !== 'active') {
      return NextResponse.redirect(new URL('/settings/billing', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next|auth).*)']
}
```

## BetterAuth Config

Update `lib/auth.ts` to handle default team and deletion:

```typescript
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'sqlite' }),
  user: {
    deleteUser: {
      enabled: true,
      afterDelete: async ({ user }) => {
        const userId = user.id
        await db.delete(subscriptions).where(eq(subscriptions.userId, userId))
        ;(await cookies()).delete('better-auth.session_token')
        redirect('/auth')
      }
    },
    // Add default team on signup
    afterCreate: async ({ user }) => {
      await db
        .insert(teams)
        .values({ id: user.id, name: `${user.name}'s Team` })
      await db
        .insert(subscriptions)
        .values({ userId: user.id, plan: 'free', teamSize: 1 })
      await db
        .insert(team_members)
        .values({ teamId: user.id, userId: user.id, role: 'owner' })
    }
  }
  // ... other config ...
})
```

## Security Best Practices

- Validate all inputs server-side (e.g., email in `addTeamMember`).
- Use Stripe webhooks to update `subscriptions` status.
- Implement rate limiting for subscription changes (e.g., `upstash-ratelimit`).
- Ensure Stripe API keys are in `.env` and never exposed client-side.

## Next Steps

- Set up Stripe Dashboard with products (Free, Monthly $10, Yearly $100, Lifetime $300).
- Add `.env` variables (e.g., `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`).
- Test subscription upgrades and team invites.
- Provide code files (e.g., `db/schema.ts`) if context is missing.

```

```
