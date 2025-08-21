'use server'

import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe/stripe'
import { PRICE_IDS, PlanKey, BillingInterval } from '@/lib/plans'
import { ensureStripeCustomerForActiveOrg } from './billings'
import { getActiveOrgId, requireOwner } from './organizations'

export async function createCheckoutSession({
  plan,
  interval,
  quantity = 1 // keep 1 for now; wire seats later
}: {
  plan: PlanKey
  interval: BillingInterval
  quantity?: number
}) {
  // Make sure we act on caller's session
  await headers()

  // Security: only org owners can buy/upgrade
  await requireOwner()

  const orgId = await getActiveOrgId()
  if (!orgId) throw new Error('No active organization.')

  const customerId = await ensureStripeCustomerForActiveOrg()
  const price = PRICE_IDS[interval][plan]

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price, quantity }],
    allow_promotion_codes: true,
    client_reference_id: orgId,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing?checkout=cancelled`,
    // Helpful for reconciliation/debugging in Dashboard and webhooks:
    subscription_data: {
      metadata: { organizationId: orgId, plan, interval }
    },
    metadata: { organizationId: orgId, plan, interval }
  }) // API: Create a Checkout Session. :contentReference[oaicite:0]{index=0}

  return { url: session.url! }
}
