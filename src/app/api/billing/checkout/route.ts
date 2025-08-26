// app/billing/checkout/route.ts
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { requireOwner } from '@/lib/auth/guards'
import { getActiveOrgId } from '@/lib/auth/org-context'
import { ensureStripeCustomerForActiveOrg } from '@/lib/billing/customer'
import { PRICE_IDS } from '@/lib/billing/plans.config'
import { stripe } from '@/lib/stripe/stripe'

import { BillingInterval, PlanKey } from '../../../../../types/billing'

export const runtime = 'nodejs'

const PLAN_KEYS: PlanKey[] = ['starter', 'pro']
const INTERVALS: BillingInterval[] = ['monthly', 'yearly']

export async function GET(req: NextRequest) {
  await headers()
  await requireOwner()

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
      { error: 'Invalid plan/interval' },
      { status: 400 }
    )
  }

  const orgId = await getActiveOrgId()
  if (!orgId)
    return NextResponse.json(
      { error: 'No active organization' },
      { status: 400 }
    )

  const customerId = await ensureStripeCustomerForActiveOrg()
  const price = PRICE_IDS[interval][plan]

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price, quantity }],
    allow_promotion_codes: true,
    client_reference_id: orgId,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?checkout=cancelled`,
    subscription_data: { metadata: { organizationId: orgId, plan, interval } },
    metadata: { organizationId: orgId, plan, interval }
  })

  return NextResponse.redirect(session.url!, { status: 303 })
}
