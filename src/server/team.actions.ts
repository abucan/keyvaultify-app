// src/server/team.actions.ts
'use server'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect, unauthorized } from 'next/navigation'

import { auth } from '@/lib/better-auth/auth'
import { mapError } from '@/lib/errors/mapError'
import { requireRole } from '@/lib/teams/acl'
import { assertTeamSlug, normalizeTeamSlug } from '@/lib/teams/validation'
import {
  addTeamFormSchema,
  teamSettingsFormSchema
} from '@/lib/zod-schemas/form-schema'
import { R } from '@/types/result'
import { Member, Organization } from 'better-auth/plugins'

function normalizeSlug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function safeJSON<T = any>(v: unknown): T {
  try {
    return typeof v === 'string' ? JSON.parse(v) : ((v as T) ?? ({} as T))
  } catch {
    return {} as T
  }
}

export async function createTeamAction(
  formData: FormData
): Promise<R<{ id: string }>> {
  const input = {
    name: String(formData.get('name') ?? '').trim(),
    slug: String(formData.get('slug') ?? '').trim()
  }

  const parsed = addTeamFormSchema.safeParse(input)
  if (!parsed.success)
    return {
      ok: false,
      code: 'INVALID_INPUT',
      message: 'Please provide a valid name and slug.'
    }

  const name = parsed.data.name
  const slug = normalizeTeamSlug(parsed.data.slug)
  try {
    assertTeamSlug(slug)
  } catch {
    return {
      ok: false,
      code: 'INVALID_INPUT',
      message: 'Please provide a valid slug.'
    }
  }

  try {
    const _headers = await headers()
    const session = await auth.api.getSession({ headers: _headers })
    if (!session?.user) {
      unauthorized()
    }

    await auth.api.checkOrganizationSlug({
      headers: _headers,
      body: { slug }
    })

    const created = await auth.api.createOrganization({
      headers: _headers,
      body: { name, slug, metadata: { default_role: 'member' } }
    })

    await auth.api.setActiveOrganization({
      headers: _headers,
      body: { organizationId: created?.id }
    })

    return { ok: true, data: { id: created?.id ?? '' } }
  } catch (error) {
    const { code, message } = mapError(error)
    return { ok: false, code, message }
  }
}

export async function switchTeamAction(
  targetOrgId: string
): Promise<R<{ name: string }>> {
  if (!targetOrgId) {
    return { ok: false, code: 'MISSING_ORG_ID' }
  }

  try {
    const _headers = await headers()
    const targetOrg = await auth.api.getFullOrganization({
      headers: _headers,
      query: { organizationId: targetOrgId }
    })
    if (!targetOrg) {
      return { ok: false, code: 'NOT_FOUND_OR_NO_ACCESS' }
    }

    await auth.api.setActiveOrganization({
      headers: _headers,
      body: { organizationId: targetOrgId }
    })

    // return { ok: true, data: { name: newActiveOrg?.name ?? '' } }
  } catch (error) {
    const { code, message } = mapError(error)
    return { ok: false, code, message }
  }

  redirect('/dashboard')
}

export async function listTeams() {
  const res = await auth.api.listOrganizations({ headers: await headers() })
  return res ?? []
}

export async function updateTeamSettingsAction(fd: FormData): Promise<R> {
  try {
    await requireRole(['owner', 'admin'])

    const input = {
      name: String(fd.get('name') ?? '').trim(),
      slug: fd.get('slug') && normalizeSlug(String(fd.get('slug')).trim()),
      logo: String(fd.get('logo') ?? '').trim(),
      default_role: String(fd.get('default_role') ?? '').trim()
    }

    if (!teamSettingsFormSchema.safeParse(input).success) {
      return { ok: false, code: 'INVALID_INPUT' }
    }

    const _headers = await headers()
    const full = await auth.api.getFullOrganization({
      headers: _headers
    })

    if (!full) {
      return { ok: false, code: 'NOT_FOUND_OR_NO_ACCESS' }
    }

    if (input.slug && input.slug !== full.slug) {
      await requireRole(['owner'])
    }

    const oldMeta = safeJSON<Record<string, any>>(full.metadata)
    const metaUpdates: Record<string, any> = {}

    if (input.default_role && input.default_role !== oldMeta.default_role) {
      metaUpdates.default_role = input.default_role
    }

    const data: Record<string, any> = {}
    if (input.name && input.name !== full.name) data.name = input.name
    if (input.slug && input.slug !== full.slug) data.slug = input.slug
    if (input.logo && input.logo !== full.logo) data.logo = input.logo
    if (Object.keys(metaUpdates).length)
      data.metadata = { ...oldMeta, ...metaUpdates }

    if (!Object.keys(data).length) return { ok: true }

    await auth.api.updateOrganization({
      headers: _headers,
      body: { organizationId: full.id, data }
    })

    revalidatePath('/team/settings')
    return { ok: true }
  } catch (e: any) {
    const { code, message } = mapError(e)
    return { ok: false, code, message }
  }
}

export async function deleteTeamAction(): Promise<R> {
  await requireRole(['owner'])
  try {
    const full = await auth.api.getFullOrganization({
      headers: await headers()
    })

    if (!full) {
      return { ok: false, code: 'NOT_FOUND' }
    }

    await auth.api.deleteOrganization({
      headers: await headers(),
      body: { organizationId: full?.id ?? '' }
    })

    return { ok: true }
  } catch (e: any) {
    const { code, message } = mapError(e)
    return { ok: false, code, message }
  }
}

export async function getTeamInformation(): Promise<
  R<{ organization: Organization; hasPermission: boolean }>
> {
  try {
    const _headers = await headers()

    const [organization, perm] = await Promise.all([
      auth.api.getFullOrganization({
        headers: _headers
      }) as Promise<Organization>,
      auth.api.hasPermission({
        headers: _headers,
        body: { permissions: { organization: ['update'] } }
      }) as Promise<{ success: boolean; error: unknown | null }>
    ])

    const hasPermission = perm.success === true

    return { ok: true, data: { organization, hasPermission } }
  } catch (error) {
    const { code, message } = mapError(error)
    return { ok: false, code, message }
  }
}
