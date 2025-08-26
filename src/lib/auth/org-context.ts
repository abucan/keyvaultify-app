// src/lib/auth/org-context.ts
import 'server-only'

import { headers } from 'next/headers'

import { auth } from '@/lib/auth'

export async function setActiveOrganization({
  organizationId,
  organizationSlug
}: {
  organizationId?: string
  organizationSlug?: string
}) {
  await auth.api.setActiveOrganization({
    headers: await headers(),
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
  return org
}
