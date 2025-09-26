// src/app/api/stripe/webhook/route.ts
import { NextRequest } from 'next/server'
import { eq } from 'drizzle-orm'
import Stripe from 'stripe' // note: value+type import

import { mapSub } from '@/app/(private)/settings/utils/webhook'
import { subscriptions } from '@/db/schemas/subscription-schema'
import { stripeCustomers } from '@/db/schemas/subscription-schema'
import { db } from '@/lib/sqlite-db'
import { stripe } from '@/lib/stripe/stripe'

export const runtime = 'nodejs'

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
