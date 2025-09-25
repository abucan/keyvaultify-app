import 'server-only'

import { revalidateTag } from 'next/cache'
import { headers } from 'next/headers'

import { auth } from '@/lib/better-auth/auth'
import { BusinessError } from '@/lib/errors/business-error'
import { mapError } from '@/lib/errors/mapError'
import { addTeamFormSchema } from '@/lib/zod-schemas/form-schema'

import { assertTeamSlug, normalizeTeamSlug } from '../_utils/slug'

import { TEAMS_TAG } from './team.tags'

export async function createTeam(name: string, slug: string): Promise<string> {
  const input = { name: name.trim(), slug: slug.trim() }
  const parsed = addTeamFormSchema.safeParse(input)

  if (!parsed.success) {
    throw new BusinessError(
      'INVALID_INPUT',
      'Please provide a valid name and slug.'
    )
  }

  const cleanedSlug = normalizeTeamSlug(parsed.data.slug)
  assertTeamSlug(cleanedSlug)

  const _headers = await headers()

  try {
    await auth.api.checkOrganizationSlug({
      headers: _headers,
      body: { slug: cleanedSlug }
    })
    const created = await auth.api.createOrganization({
      headers: _headers,
      body: { name, slug: cleanedSlug, metadata: { default_role: 'member' } }
    })

    if (!created?.id) {
      throw new BusinessError('UNKNOWN', 'Failed to create organization')
    }

    await auth.api.setActiveOrganization({
      headers: _headers,
      body: { organizationId: created.id }
    })

    return created.id
  } catch (error: any) {
    const { code, message } = mapError(error)
    throw new BusinessError(code, message ?? 'Unexpected error')
  }
}
