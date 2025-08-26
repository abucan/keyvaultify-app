// app/billing/portal/route.ts
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

import { requireOwner } from '@/lib/auth/guards'
import { ensureStripeCustomerForActiveOrg } from '@/lib/billing/customer'
import { stripe } from '@/lib/stripe/stripe'

export const runtime = 'nodejs'

export async function GET() {
  await headers()
  await requireOwner()

  const customerId = await ensureStripeCustomerForActiveOrg()
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing`
  })

  return NextResponse.redirect(session.url!, { status: 303 })
}
