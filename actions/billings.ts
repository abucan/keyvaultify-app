'use server'

import { db } from '@/lib/db'
import { getActiveOrgFull, getActiveOrgId, requireOwner } from './organizations'
import { stripe } from '@/lib/stripe/stripe'
import { stripeCustomers } from '@/lib/schemas/subscription-schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'

export async function ensureStripeCustomerForActiveOrg() {
  const orgId = await getActiveOrgId()
  if (!orgId) throw new Error('No active organization.')

  const existing = await db.query.stripeCustomers.findFirst({
    where: eq(stripeCustomers.organizationId, orgId)
  })
  if (existing) return existing.stripeCustomerId

  const org = await getActiveOrgFull() // includes org + members
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ownerEmail = org?.members?.find((m: any) =>
    Array.isArray(m.role) ? m.role.includes('owner') : m.role === 'owner'
  )?.user?.email

  const customer = await stripe.customers.create({
    name: org?.name,
    email: ownerEmail,
    metadata: { organizationId: orgId } // helpful in Stripe Dashboard
  }) // POST /v1/customers :contentReference[oaicite:2]{index=2}

  await db.insert(stripeCustomers).values({
    organizationId: orgId,
    stripeCustomerId: customer.id
  })

  return customer.id
}

export async function openBillingPortal() {
  // (headers() not strictly needed here, but consistent with other server actions)
  await headers()

  const customerId = await ensureStripeCustomerForActiveOrg()
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing`
  }) // POST /v1/billing_portal/sessions :contentReference[oaicite:4]{index=4}

  return { url: session.url! }
}

export async function openBillingPortalManaged() {
  await headers() // bind to caller session
  await requireOwner() // owner-only

  const customerId = await ensureStripeCustomerForActiveOrg()
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing`
  })
  return { url: session.url! }
}
