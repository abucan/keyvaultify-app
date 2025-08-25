// app/actions/_admin/fix-sub-periods.ts
'use server'

import { eq } from 'drizzle-orm'
import type Stripe from 'stripe'

// paste the same mapSub from the webhook file (or import it)
import { db } from '@/lib/db'
import { subscriptions } from '@/lib/schemas/subscription-schema'
import { stripe } from '@/lib/stripe/stripe'
import { mapSub } from '@/app/api/stripe/webhook/route'

export async function backfillActiveOrgSubscription(orgId: string) {
  console.log('backfillActiveOrgSubscription', orgId)
  const sub = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.organizationId, orgId),
    columns: { stripeSubscriptionId: true }
  })
  if (!sub?.stripeSubscriptionId) return

  const full = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId)
  const row = mapSub(orgId, full as Stripe.Subscription)

  await db.insert(subscriptions).values(row).onConflictDoUpdate({
    target: subscriptions.stripeSubscriptionId,
    set: row
  })
}
