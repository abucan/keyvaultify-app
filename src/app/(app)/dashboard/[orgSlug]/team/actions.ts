'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { APIError } from 'better-auth/api'

import { auth } from '@/lib/better-auth/auth'
import { orgDash } from '@/lib/router/path'
import { assertTeamSlug, normalizeTeamSlug } from '@/lib/teams/validation'

export async function createTeamAction(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  let slug = String(formData.get('slug') ?? '').trim()
  if (!name || !slug) throw new Error('Missing name or slug')

  slug = normalizeTeamSlug(slug)
  assertTeamSlug(slug)

  // Check availability (don’t leak exact reason on failure to the UI)
  try {
    await auth.api.checkOrganizationSlug({
      headers: await headers(),
      body: { slug }
    })

    await auth.api.createOrganization({
      headers: await headers(),
      body: { name, slug }
    })

    // Make it active for this session
    await auth.api.setActiveOrganization({
      headers: await headers(),
      body: { organizationSlug: slug }
    })
  } catch (error: unknown) {
    if (error instanceof APIError) {
      console.log(error)
      throw new Error(error?.body?.code)
    }
    throw new Error('Failed to create team')
  } finally {
    //  revalidatePath('/dashboard')
    //d  redirect('/dashboard')
  }
}

export async function switchTeamAction(
  targetOrgId: string,
  currentPathname: string
) {
  if (!targetOrgId) throw new Error('Missing organizationId')

  await auth.api.setActiveOrganization({
    headers: await headers(),
    body: { organizationId: targetOrgId }
  })

  // Get slug for target id
  const full = await auth.api.getFullOrganization({ headers: await headers() })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const slug = (full as any)?.slug as string
  const rest = currentPathname.replace(/^\/dashboard\/[^/]+/, '') || '/'
  redirect(orgDash(slug, rest))
}

export async function listTeams() {
  const res = await auth.api.listOrganizations({ headers: await headers() })
  return res ?? []
}
