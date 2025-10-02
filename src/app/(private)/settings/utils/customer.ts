// src/app/(private)/settings/utils/customer.ts
import 'server-only'

import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'

import { stripeCustomers } from '@/db/schemas/subscription-schema'
import { requireOwner } from '@/lib/auth/guards'
import { auth } from '@/lib/better-auth/auth'
import { db } from '@/lib/sqlite-db'
import { stripe } from '@/lib/stripe/stripe'

export async function ensureStripeCustomerForUser(userId?: string) {
  if (!userId) {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) throw new Error('No user session.')
    userId = session.user.id
  }

  const existing = await db.query.stripeCustomers.findFirst({
    where: eq(stripeCustomers.userId, userId)
  })
  if (existing) return existing.stripeCustomerId

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('No user session.')

  const customer = await stripe.customers.create({
    email: session.user.email,
    name: session.user.name || session.user.email?.split('@')[0],
    metadata: { 
      userId: userId,
      source: 'user_registration'
    }
  })

  await db.insert(stripeCustomers).values({
    userId: userId,
    stripeCustomerId: customer.id
  })

  return customer.id
}

export async function openBillingPortal() {
  await headers()

  const customerId = await ensureStripeCustomerForUser()
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`
  })

  return { url: session.url! }
}

export async function openBillingPortalManaged() {
  await headers()
  await requireOwner()

  const customerId = await ensureStripeCustomerForUser()
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`
  })
  return { url: session.url! }
}
