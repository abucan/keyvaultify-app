// src/lib/billing/customer.ts
import 'server-only'

import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'

import { stripeCustomers } from '@/db/schemas/subscription-schema'
import { db } from '@/lib/db'
import { stripe } from '@/lib/stripe/stripe'

import {
  getActiveOrgFull,
  getActiveOrgId,
  requireOwner
} from '../../../actions/organizations'

export async function ensureStripeCustomerForActiveOrg() {
  const orgId = await getActiveOrgId()
  if (!orgId) throw new Error('No active organization.')

  const existing = await db.query.stripeCustomers.findFirst({
    where: eq(stripeCustomers.organizationId, orgId)
  })
  if (existing) return existing.stripeCustomerId

  const org = await getActiveOrgFull()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ownerEmail = org?.members?.find((m: any) =>
    Array.isArray(m.role) ? m.role.includes('owner') : m.role === 'owner'
  )?.user?.email

  const customer = await stripe.customers.create({
    name: org?.name,
    email: ownerEmail,
    metadata: { organizationId: orgId }
  })

  await db.insert(stripeCustomers).values({
    organizationId: orgId,
    stripeCustomerId: customer.id
  })

  return customer.id
}

export async function openBillingPortal() {
  await headers()

  const customerId = await ensureStripeCustomerForActiveOrg()
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing`
  })

  return { url: session.url! }
}

export async function openBillingPortalManaged() {
  await headers()
  await requireOwner()

  const customerId = await ensureStripeCustomerForActiveOrg()
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing`
  })
  return { url: session.url! }
}
