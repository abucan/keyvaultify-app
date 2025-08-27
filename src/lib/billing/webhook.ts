// src/lib/billing/webhook.ts
import Stripe from 'stripe'

import { subscriptions } from '@/db/schemas/subscription-schema'

type SubInsert = typeof subscriptions.$inferInsert

export function mapSub(
  orgId: string,
  sub: Stripe.Subscription
): Omit<SubInsert, 'id' | 'createdAt'> {
  const items = sub?.items.data ?? []

  const starts = items
    .map((it: Stripe.SubscriptionItem) => it?.['current_period_start'])
    .filter(Boolean) as number[]

  const ends = items
    .map((it: Stripe.SubscriptionItem) => it?.['current_period_end'])
    .filter(Boolean) as number[]

  const periodStartMs = starts.length > 0 ? Math.min(...starts) * 1000 : null
  const periodEndMs = ends.length > 0 ? Math.max(...ends) * 1000 : null

  const firstPrice = items[0]?.price as Stripe.Price | undefined

  const stripeProductId =
    (typeof firstPrice?.product === 'string'
      ? firstPrice?.product
      : firstPrice?.product?.id) ?? null

  return {
    organizationId: orgId,
    stripeSubscriptionId: sub.id,
    stripeCustomerId: String(sub.customer),

    status: sub.status,
    mode: 'subscription',

    stripePriceId: firstPrice?.id ?? null,
    stripeProductId: stripeProductId ?? null,
    quantity: items[0]?.quantity ?? 1,

    currency: firstPrice?.currency ?? null,
    unitAmount: firstPrice?.unit_amount ?? null,

    currentPeriodStart: periodStartMs ? new Date(periodStartMs) : null,
    currentPeriodEnd: periodEndMs ? new Date(periodEndMs) : null,

    cancelAt: sub.cancel_at ? new Date(sub.cancel_at * 1000) : null,
    cancelAtPeriodEnd: sub.cancel_at_period_end ? 1 : 0,

    updatedAt: new Date()
  }
}
