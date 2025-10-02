// src/app/api/billing/checkout/route.ts
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { ensureStripeCustomerForUser } from '@/app/(private)/settings/utils/customer'
import { PRICE_IDS } from '@/app/(private)/settings/utils/price-ids'
import { requireOwner } from '@/lib/auth/guards'
import { auth } from '@/lib/better-auth/auth'
import { stripe } from '@/lib/stripe/stripe'
import { BillingInterval, PlanKey } from '@/types/billing'

export const runtime = 'nodejs'

const PLAN_KEYS: PlanKey[] = ['starter', 'pro']
const INTERVALS: BillingInterval[] = ['monthly', 'yearly']

export async function GET(req: NextRequest) {
  await headers()
  await requireOwner()

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json(
      { error: 'UNAUTHORIZED', message: 'Please sign in' },
      { status: 401 }
    )
  }

  const url = new URL(req.url)
  const plan = url.searchParams.get('plan') as PlanKey | null
  const interval = url.searchParams.get('interval') as BillingInterval | null
  const quantity = Number(url.searchParams.get('qty') ?? '1') || 1

  if (
    !plan ||
    !interval ||
    !PLAN_KEYS.includes(plan) ||
    !INTERVALS.includes(interval)
  ) {
    return NextResponse.json(
      { error: 'INVALID_REQUEST', message: 'Invalid plan/interval' },
      { status: 400 }
    )
  }

  const customerId = await ensureStripeCustomerForUser(session.user.id)
  const price = PRICE_IDS[interval][plan]

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price, quantity }],
    allow_promotion_codes: true,
    client_reference_id: session.user.id,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?checkout=cancelled`,
    subscription_data: { 
      metadata: { 
        userId: session.user.id, 
        plan, 
        interval 
      } 
    },
    metadata: { 
      userId: session.user.id, 
      plan, 
      interval 
    }
  })

  return NextResponse.redirect(checkoutSession.url!, { status: 303 })
}
