'use server'

import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function setActiveOrganization({
  organizationId,
  organizationSlug
}: {
  organizationId?: string
  organizationSlug?: string
}) {
  await auth.api.setActiveOrganization({
    headers: await headers(), // ensures we mutate the caller's session
    body: { organizationId: organizationId ?? null, organizationSlug }
  })
}

export async function getActiveOrgId() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  return session?.session?.activeOrganizationId ?? null
}

export async function getActiveOrgFull() {
  const org = await auth.api.getFullOrganization({
    headers: await headers()
  })
  return org // includes members, etc.
}

export async function requireOwner() {
  const member = await auth.api.getActiveMember({
    headers: await headers()
  })

  const roles = Array.isArray(member?.role) ? member!.role : [member?.role]

  if (!roles?.includes('owner')) {
    throw new Error('Forbidden')
  }
  return member
}
