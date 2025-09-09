// src/server/team.actions.ts
'use server'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { APIError } from 'better-auth/api'

import { auth } from '@/lib/better-auth/auth'
import { requireRole } from '@/lib/teams/acl'
import { assertTeamSlug, normalizeTeamSlug } from '@/lib/teams/validation'
import { TeamSwitchResult } from '@/types/api-results'

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
  targetOrgId: string
): Promise<TeamSwitchResult> {
  try {
    if (!targetOrgId) return { ok: false, code: 'MISSING_ORG_ID' }

    const hdrs = await headers()

    const targetOrg = await auth.api.getFullOrganization({
      headers: hdrs,
      query: { organizationId: targetOrgId }
    })
    if (!targetOrg) return { ok: false, code: 'NOT_FOUND_OR_NO_ACCESS' }

    await auth.api.setActiveOrganization({
      headers: hdrs,
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
    billing_email: String(
      fd.get('billing_email') ?? oldMetadata?.billing_email ?? ''
    ),
    default_role: String(
      fd.get('default_role') ?? oldMetadata?.default_role ?? ''
    )
  }

  const { name, slug, logo, billing_email, default_role } = raw

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
            ...(billing_email ? { billing_email } : {}),
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
