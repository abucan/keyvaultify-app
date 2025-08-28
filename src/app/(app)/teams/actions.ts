'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { APIError } from 'better-auth/api'

import { auth } from '@/lib/better-auth/auth'
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

export async function switchTeamAction(formData: FormData) {
  const organizationId = String(formData.get('organizationId') ?? '')
  if (!organizationId) throw new Error('Missing organizationId')

  await auth.api.setActiveOrganization({
    headers: await headers(),
    body: { organizationId }
  })

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function listTeams() {
  const res = await auth.api.listOrganizations({ headers: await headers() })
  return res ?? []
}
