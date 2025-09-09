// src/app/onboarding/page.tsx
import 'server-only'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/better-auth/auth'

export default async function OnboardingPage() {
  const _headers = await headers()

  const session = await auth.api.getSession({ headers: _headers })
  if (!session?.user) redirect('/signin?next=/onboarding')

  const active = await auth.api
    .getFullOrganization({ headers: _headers })
    .catch(() => null)
  if (active?.id) redirect('/dashboard')

  const orgs = await auth.api.listOrganizations({ headers: _headers })
  if (orgs?.length) {
    await auth.api.setActiveOrganization({
      headers: _headers,
      body: { organizationId: orgs[0].id }
    })
    redirect('/dashboard')
  }

  const base =
    (session.user.email?.split('@')[0] ?? 'workspace')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, 30) || 'workspace'

  const name = `Personal Workspace`

  let created = await auth.api
    .createOrganization({
      headers: _headers,
      body: { name, slug: base, metadata: { isPersonal: true } }
    })
    .catch(() => null)

  if (!created?.id) {
    const alt = `${base}-${Math.random().toString(36).slice(2, 6)}`
    created = await auth.api
      .createOrganization({
        headers: _headers,
        body: { name, slug: alt, metadata: { isPersonal: true } }
      })
      .catch(() => null)
  }

  if (created?.id) {
    await auth.api.setActiveOrganization({
      headers: _headers,
      body: { organizationId: created.id }
    })
  }

  redirect('/dashboard')
}
