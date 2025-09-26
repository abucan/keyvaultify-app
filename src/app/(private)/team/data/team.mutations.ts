// src/app/(private)/team/data/team.mutations.ts
import 'server-only'

import { unauthorized } from 'next/dist/client/components/navigation'
import { headers } from 'next/headers'

import { auth } from '@/lib/better-auth/auth'
import { BusinessError } from '@/lib/errors/business-error'
import { mapError } from '@/lib/errors/mapError'
import {
  addMemberFormSchema,
  addTeamFormSchema,
  teamSettingsFormSchema
} from '@/lib/zod-schemas/form-schema'
import { Role } from '@/types/auth'

import { ensureOwnerSafety, requireRole } from '../utils/acl'
import { assertTeamSlug, normalizeTeamSlug } from '../utils/slug'

function safeJSON<T = any>(v: unknown): T {
  try {
    return typeof v === 'string' ? JSON.parse(v) : ((v as T) ?? ({} as T))
  } catch {
    return {} as T
  }
}

export async function createTeam(name: string, slug: string): Promise<string> {
  const parsedInput = addTeamFormSchema.safeParse({ name, slug })

  if (!parsedInput.success) {
    throw new BusinessError(
      'INVALID_INPUT',
      'Please provide a valid name and slug.'
    )
  }

  const cleanedSlug = normalizeTeamSlug(parsedInput.data.slug)
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

export async function updateTeam(
  name: string,
  slug: string,
  logo: string,
  default_role: string
): Promise<void> {
  await requireRole(['owner', 'admin'])
  const parsedInput = teamSettingsFormSchema.safeParse({
    name,
    slug,
    logo,
    default_role
  })

  if (!parsedInput.success) {
    throw new BusinessError(
      'INVALID_INPUT',
      'Please provide a valid name, slug, logo, and default role.'
    )
  }

  const _headers = await headers()

  try {
    const full = await auth.api.getFullOrganization({ headers: _headers })
    if (!full) {
      throw new BusinessError(
        'NOT_FOUND_OR_NO_ACCESS',
        'No active organization'
      )
    }

    const metadata = safeJSON<Record<string, any>>(full?.metadata)

    if (parsedInput.data.slug && parsedInput.data.slug !== full.slug) {
      if (metadata?.isPersonal) {
        throw new BusinessError(
          'IS_PERSONAL_ORG',
          'You cannot change the slug of a personal organization'
        )
      }
      await requireRole(['owner'])
    }

    const oldMeta = safeJSON<Record<string, any>>(full.metadata)
    const metaUpdates: Record<string, any> = {}

    if (
      parsedInput.data.default_role &&
      parsedInput.data.default_role !== oldMeta.default_role
    ) {
      metaUpdates.default_role = parsedInput.data.default_role
    }

    const data: Record<string, any> = {}
    if (parsedInput.data.name && parsedInput.data.name !== full.name)
      data.name = parsedInput.data.name
    if (parsedInput.data.slug && parsedInput.data.slug !== full.slug)
      data.slug = parsedInput.data.slug
    if (parsedInput.data.logo && parsedInput.data.logo !== full.logo)
      data.logo = parsedInput.data.logo
    if (Object.keys(metaUpdates).length)
      data.metadata = { ...oldMeta, ...metaUpdates }

    if (!Object.keys(data).length)
      throw new BusinessError('NO_CHANGES', 'No changes to update')

    await auth.api.updateOrganization({
      headers: _headers,
      body: { organizationId: full.id, data }
    })
  } catch (error: any) {
    const { code, message } = mapError(error)
    throw new BusinessError(code, message ?? 'Unexpected error')
  }
}

export async function deleteTeam(): Promise<void> {
  await requireRole(['owner'])
  const _headers = await headers()
  try {
    const full = await auth.api.getFullOrganization({ headers: _headers })
    if (!full) {
      throw new BusinessError(
        'NOT_FOUND_OR_NO_ACCESS',
        'No active organization'
      )
    }

    await auth.api.deleteOrganization({
      headers: _headers,
      body: { organizationId: full.id }
    })
  } catch (error: any) {
    const { code, message } = mapError(error)
    throw new BusinessError(code, message ?? 'Unexpected error')
  }
}

export async function leaveTeam(): Promise<void> {
  await requireRole(['member'])
  const _headers = await headers()
  try {
    const full = await auth.api.getFullOrganization({ headers: _headers })
    if (!full) {
      throw new BusinessError(
        'NOT_FOUND_OR_NO_ACCESS',
        'No active organization'
      )
    }

    const members = full?.members ?? []
    const session = await auth.api.getSession({ headers: _headers })

    if (!session) unauthorized()

    const me = members.find((m: any) => m.userId === session?.session?.userId)
    const owners = members.filter((m: any) => m.role === 'owner')
    const isSoleOwner = me?.role === 'owner' && owners.length <= 1

    if (isSoleOwner)
      throw new BusinessError('LAST_OWNER_PROTECTED', 'Cannot leave the team')

    await auth.api.leaveOrganization({
      headers: _headers,
      body: { organizationId: full.id }
    })

    const orgs = await auth.api.listOrganizations({
      headers: _headers
    })

    const personalOrg = orgs?.find(
      (o: any) => JSON.parse(o.metadata)?.isPersonal === true
    )

    if (orgs?.length > 0) {
      await auth.api.setActiveOrganization({
        headers: _headers,
        body: { organizationId: personalOrg?.id ?? orgs[0]?.id ?? '' }
      })
    }
  } catch (error: any) {
    const { code, message } = mapError(error)
    throw new BusinessError(code, message ?? 'Unexpected error')
  }
}

export async function switchTeam(targetOrgId: string): Promise<void> {
  await requireRole(['member'])
  const _headers = await headers()
  try {
    const targetOrg = await auth.api.getFullOrganization({
      headers: _headers,
      query: { organizationId: targetOrgId }
    })
    if (!targetOrg) {
      throw new BusinessError(
        'NOT_FOUND_OR_NO_ACCESS',
        'No active organization'
      )
    }

    await auth.api.setActiveOrganization({
      headers: _headers,
      body: { organizationId: targetOrgId }
    })
  } catch (error: any) {
    const { code, message } = mapError(error)
    throw new BusinessError(code, message ?? 'Unexpected error')
  }
}

export async function inviteMember(
  email: string,
  role: string
): Promise<{ email: string }> {
  const parsedInput = addMemberFormSchema.safeParse({ email, role })
  if (!parsedInput.success) {
    throw new BusinessError(
      'INVALID_INPUT',
      'Please provide a valid email and role.'
    )
  }

  const _headers = await headers()
  try {
    await auth.api.createInvitation({
      headers: _headers,
      body: { email, role: role as 'member' | 'admin' | 'owner' }
    })
    return { email: parsedInput.data.email }
  } catch (error: any) {
    const { code, message } = mapError(error)
    throw new BusinessError(code, message ?? 'Unexpected error')
  }
}

export async function updateMemberRole(
  memberId: string,
  role: string
): Promise<{ role: string }> {
  const parsedInput = addMemberFormSchema.safeParse({ memberId, role })
  if (!parsedInput.success) {
    throw new BusinessError(
      'INVALID_INPUT',
      'Please provide a valid memberId and role.'
    )
  }

  const _headers = await headers()
  try {
    await ensureOwnerSafety(memberId, role as Role)
    await auth.api.updateMemberRole({
      headers: _headers,
      body: { memberId, role: role as 'member' | 'admin' | 'owner' }
    })
    return { role: parsedInput.data.role }
  } catch (error: any) {
    const { code, message } = mapError(error)
    throw new BusinessError(code, message ?? 'Unexpected error')
  }
}

export async function removeMember(memberId: string): Promise<void> {
  if (!memberId) {
    throw new BusinessError('INVALID_INPUT', 'Please provide a valid memberId.')
  }

  const _headers = await headers()
  try {
    await ensureOwnerSafety(memberId)
    await auth.api.removeMember({
      headers: _headers,
      body: { memberIdOrEmail: memberId }
    })
  } catch (error: any) {
    const { code, message } = mapError(error)
    throw new BusinessError(code, message ?? 'Unexpected error')
  }
}

export async function resendInvitation(
  email: string,
  role: string
): Promise<{ email: string }> {
  const parsedInput = addMemberFormSchema.safeParse({ email, role })
  if (!parsedInput.success) {
    throw new BusinessError(
      'INVALID_INPUT',
      'Please provide a valid email and role.'
    )
  }

  const _headers = await headers()
  try {
    await auth.api.createInvitation({
      headers: _headers,
      body: { email, role: role as 'member' | 'admin' | 'owner', resend: true }
    })
    return { email: parsedInput.data.email }
  } catch (error: any) {
    const { code, message } = mapError(error)
    throw new BusinessError(code, message ?? 'Unexpected error')
  }
}

export async function cancelInvitation(
  invitationId: string
): Promise<{ email: string }> {
  if (!invitationId) {
    throw new BusinessError(
      'INVALID_INPUT',
      'Please provide a valid invitationId.'
    )
  }

  const _headers = await headers()
  try {
    const res = await auth.api.cancelInvitation({
      headers: _headers,
      body: { invitationId }
    })
    return { email: res?.email ?? '' }
  } catch (error: any) {
    const { code, message } = mapError(error)
    throw new BusinessError(code, message ?? 'Unexpected error')
  }
}
