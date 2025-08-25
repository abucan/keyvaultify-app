/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/stripe/webhook/route.ts
import { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe/stripe'
import { db } from '@/lib/db'
import { subscriptions } from '@/lib/schemas/subscription-schema'
import { stripeCustomers } from '@/lib/schemas/subscription-schema'
import { eq } from 'drizzle-orm'
import Stripe from 'stripe' // note: value+type import

export const runtime = 'nodejs'

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

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const sig = req.headers.get('stripe-signature')
  const secret = process.env.STRIPE_WEBHOOK_SECRET!
  if (!sig || !secret)
    return new Response('Missing signature/secret', { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret)
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  const getOrgIdByCustomer = async (customerId: string) => {
    const row = await db.query.stripeCustomers.findFirst({
      where: eq(stripeCustomers.stripeCustomerId, customerId),
      columns: { organizationId: true }
    })
    return row?.organizationId ?? null
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (
        session.mode === 'subscription' &&
        session.subscription &&
        session.customer
      ) {
        const orgId = await getOrgIdByCustomer(String(session.customer))
        if (orgId) {
          const sub = await stripe.subscriptions.retrieve(
            String(session.subscription)
          )
          const row = mapSub(orgId, sub)

          await db
            .insert(subscriptions)
            .values(row) // no id/createdAt; let defaults work
            .onConflictDoUpdate({
              target: subscriptions.stripeSubscriptionId,
              set: row
            })
        }
      }
      break
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const orgId = await getOrgIdByCustomer(String(sub.customer))
      if (orgId) {
        const row = mapSub(orgId, sub)

        await db.insert(subscriptions).values(row).onConflictDoUpdate({
          target: subscriptions.stripeSubscriptionId,
          set: row
        })
      }
      break
    }

    default:
      // ignore others for now
      break
  }

  return new Response('ok', { status: 200 })
}
