// src/server/team.actions.ts
'use server'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { APIError } from 'better-auth/api'

import { auth } from '@/lib/better-auth/auth'
import { mapError } from '@/lib/errors/mapError'
import { requireRole } from '@/lib/teams/acl'
import { assertTeamSlug, normalizeTeamSlug } from '@/lib/teams/validation'
import { addTeamFormSchema } from '@/lib/zod-schemas/form-schema'
import { R, TeamSwitchResult } from '@/types/result'

function normalizeSlug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function safeParseJSON(str: string) {
  try {
    return JSON.parse(str)
  } catch {
    return {} as any
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
    if (!session?.user)
      return {
        ok: false,
        code: 'NOT_AUTHORIZED',
        message: 'You must be logged in to create a team.'
      }

    await auth.api.checkOrganizationSlug({
      headers: _headers,
      body: { slug }
    })

    const created = await auth.api.createOrganization({
      headers: _headers,
      body: { name, slug }
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
): Promise<TeamSwitchResult> {
  try {
    if (!targetOrgId) return { ok: false, code: 'MISSING_ORG_ID' }

    const _headers = await headers()

    const targetOrg = await auth.api.getFullOrganization({
      headers: _headers,
      query: { organizationId: targetOrgId }
    })
    if (!targetOrg) return { ok: false, code: 'NOT_FOUND_OR_NO_ACCESS' }

    await auth.api.setActiveOrganization({
      headers: _headers,
      body: { organizationId: targetOrgId }
    })

    return { ok: true }
  } catch {
    return { ok: false, code: 'UNKNOWN' }
  }
}

export async function listTeams() {
  const res = await auth.api.listOrganizations({ headers: await headers() })
  return res ?? []
}

export async function updateTeamSettingsAction(
  fd: FormData
): Promise<TeamSwitchResult> {
  await requireRole(['owner', 'admin'])

  // read active org first so we can compute oldSlug for revalidate/redirect
  const full = await auth.api.getFullOrganization({ headers: await headers() })
  // Depending on your BetterAuth wrapper shape, adjust these:
  const oldSlug = full?.slug ?? full?.slug ?? ''
  const oldName = full?.name ?? full?.name ?? ''
  const oldLogo = full?.logo ?? full?.logo ?? ''
  const oldMetadataRaw = full?.metadata ?? full?.metadata ?? '{}'
  const oldMetadata =
    typeof oldMetadataRaw === 'string'
      ? safeParseJSON(oldMetadataRaw)
      : (oldMetadataRaw ?? {})

  const raw = {
    name: String(fd.get('name') ?? oldName),
    slug: fd.get('slug') ? normalizeSlug(String(fd.get('slug'))) : undefined,
    logo: String(fd.get('logo') ?? oldLogo),
    default_role: String(
      fd.get('default_role') ?? oldMetadata?.default_role ?? ''
    )
  }

  const { name, slug, logo, default_role } = raw

  // Only owners can change slug
  if (slug && slug !== oldSlug) {
    await requireRole(['owner'])
  }

  try {
    await auth.api.updateOrganization({
      headers: await headers(),
      body: {
        organizationId: full?.id ?? '',
        data: {
          // BetterAuth org.update supports name/slug/logo/metadata
          ...(name ? { name } : {}),
          ...(slug ? { slug } : {}),
          ...(logo ? { logo } : {}),
          metadata: {
            ...(default_role ? { default_role } : {})
          }
        }
      }
    })

    // Revalidate current settings page + sidebar bits under this slug
    const targetSlug = slug || oldSlug
    revalidatePath(`/${targetSlug}/team/settings`) // your page
    revalidatePath(`/${targetSlug}`) // dashboard/home under slug, if used
    revalidatePath('/(app)') // if your sidebar/layout caches team info, adjust as needed

    // If slug changed, switch active org context + redirect into new slug route
    if (slug && slug !== oldSlug) {
      redirect(`/o/${slug}?to=/${slug}/team/settings`)
    }

    return { ok: true }
  } catch (e: any) {
    const msg = String(e?.message || '')
    if (msg.toLowerCase().includes('slug'))
      return { ok: false, code: 'SLUG_TAKEN' }
    if (msg.includes('403')) return { ok: false, code: 'NOT_AUTHORIZED' }
    console.error('updateTeamSettingsAction failed', e)
    return { ok: false, code: 'UNKNOWN' }
  }
}

export async function deleteTeamAction(): Promise<TeamSwitchResult> {
  await requireRole(['owner'])
  try {
    const full = await auth.api.getFullOrganization({
      headers: await headers()
    })
    const members = full?.members ?? full?.members ?? []
    if (Array.isArray(members) && members.length > 1) {
      return { ok: false, code: 'HAS_MEMBERS' }
    }

    await auth.api.deleteOrganization({
      headers: await headers(),
      body: { organizationId: full?.id ?? '' }
    })
    // After deletion, revalidate generic shells and go somewhere safe
    revalidatePath('/(dashboard)')
    redirect('/dashboard')
  } catch (e: any) {
    const msg = String(e?.message || '')
    if (msg.includes('403')) return { ok: false, code: 'NOT_AUTHORIZED' }
    console.error('deleteTeamAction failed', e)
    return { ok: false, code: 'UNKNOWN' }
  }
}
