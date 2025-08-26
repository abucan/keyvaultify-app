// src/lib/billing/subscriptions.ts
import 'server-only'

import { headers } from 'next/headers'

import { requireOwner } from '@/lib/auth/guards'
import { getActiveSubscriptionForOrg } from '@/lib/billing/entitlements'
import { stripe } from '@/lib/stripe/stripe'

function err(msg: string) {
  const e = new Error(msg)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(e as any).status = 400
  return e
}

export async function cancelAtPeriodEnd() {
  await headers() // bind to caller session
  await requireOwner() // owner-only

  const sub = await getActiveSubscriptionForOrg()
  if (!sub?.stripeSubscriptionId) throw err('No active subscription')
  if (sub.status === 'canceled') throw err('Subscription already canceled')

  await stripe.subscriptions.update(sub.stripeSubscriptionId, {
    cancel_at_period_end: true
  })
  // Webhooks will update your DB immediately (updated) and at period end (deleted). :contentReference[oaicite:0]{index=0}

  return { ok: true }
}

export async function resumeScheduledCancellation() {
  await headers()
  await requireOwner()

  const sub = await getActiveSubscriptionForOrg()
  if (!sub?.stripeSubscriptionId) throw err('No active subscription')

  // Only works if it's scheduled to cancel at period end.
  if (!sub.cancelAtPeriodEnd)
    throw err("Subscription isn't scheduled to cancel")

  await stripe.subscriptions.update(sub.stripeSubscriptionId, {
    cancel_at_period_end: false
  })
  // Stripe marks it to renew again at the next cycle. :contentReference[oaicite:1]{index=1}

  return { ok: true }
}
