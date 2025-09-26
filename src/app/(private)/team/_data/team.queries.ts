/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/(private)/team/_data/team.queries.ts
import 'server-only'

import { unstable_cache } from 'next/cache'
import { headers } from 'next/headers'
import { Organization } from 'better-auth/plugins'

import { auth } from '@/lib/better-auth/auth'
import { mapError } from '@/lib/errors/mapError'
import { InvitationRow, Member, MemberRow, Role, Team } from '@/types/auth'
import { R } from '@/types/result'

import { TEAMS_TAG } from './team.tags'

const _getTeamsCached = unstable_cache(
  async (_headers: Headers, _userId?: string) => {
    const orgs = await auth.api.listOrganizations({ headers: _headers })
    return orgs ?? []
  },
  ['teams-by-user'],
  { tags: [TEAMS_TAG] }
)

const _getTeamMembersCached = unstable_cache(
  async (_headers: Headers, _orgId: string, _userId?: string) => {
    const full = await auth.api.getFullOrganization({
      headers: _headers,
      query: { organizationId: _orgId }
    })
    const raw = full?.members ?? []
    const me = raw.find((m: any) => m.userId === _userId)
    const myRole = (me?.role as Role) ?? 'member'

    const ownersCount = raw.filter((m: any) => m.role === 'owner').length
    const hasOtherOwners = ownersCount > 1

    const metadata = JSON.parse(full?.metadata ?? '{}')

    const isPersonalOrg = metadata?.isPersonal ?? false
    const defaultRole = metadata?.default_role ?? 'member'

    return raw.map((item: any) => {
      const base: Member = {
        id: item.id,
        name: item.user.name,
        email: item.user.email,
        image: item.user.image,
        joinedAt: new Date(item.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        role: item.role as Role
      }

      const isOwner = item.role === 'owner'
      const isSelf = !!_userId && item.userId === _userId

      const canEditRole = myRole === 'owner' || (myRole === 'admin' && !isOwner)
      const canSetOwner = myRole === 'owner'

      const canRemove =
        !isSelf &&
        (myRole === 'owner'
          ? !isOwner || hasOtherOwners
          : myRole === 'admin'
            ? !isOwner
            : false)

      const canLeave = isSelf && (!isOwner || hasOtherOwners)

      return {
        ...base,
        _acl: { canEditRole, canRemove, canLeave, canSetOwner },
        _meta: { hasOtherOwners, isSelf, isOwner, isPersonalOrg, defaultRole }
      } satisfies MemberRow
    })
  },
  ['team-members-by-org'],
  { tags: [TEAMS_TAG] }
)

const _getTeamInvitationsCached = unstable_cache(
  async (
    _headers: Headers,
    _orgId: string,
    _userId?: string
  ): Promise<InvitationRow[]> => {
    const [full, invites] = await Promise.all([
      auth.api.getFullOrganization({
        headers: _headers,
        query: { organizationId: _orgId }
      }),
      auth.api.listInvitations({ headers: _headers })
    ])

    const members = full?.members ?? []
    const me = members.find((m: any) => m.userId === _userId)
    const myRole: Role = (me?.role as Role) ?? 'member'
    const canManage = myRole === 'owner' || myRole === 'admin'

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

    return (invites ?? []).map((inv: any) => {
      const acceptUrl = `${baseUrl}/accept-invitation/${inv.id}`

      return {
        id: inv.id,
        email: inv.email,
        role: (inv.role ?? 'member') as Role,
        expiresAt: new Date(inv.expiresAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        status: inv.status ?? 'pending',
        acceptUrl,
        _acl: {
          canResend: canManage && inv.status === 'pending',
          canCancel: canManage && inv.status === 'pending',
          canCopy: inv.status === 'pending'
        }
      } satisfies InvitationRow
    })
  },
  ['team-invitations-by-org'],
  { tags: [TEAMS_TAG] }
)

export async function getTeams(): Promise<R<Team[]>> {
  const _headers = await headers()
  const _session = await auth.api.getSession({ headers: _headers })
  return {
    ok: true,
    data: await _getTeamsCached(_headers, _session?.session?.userId)
  }
}

export async function getTeamInformation(): Promise<
  R<{ organization: Organization; hasPermission: boolean }>
> {
  try {
    const _headers = await headers()

    const [organization, perm] = await Promise.allSettled([
      auth.api.getFullOrganization({
        headers: _headers
      }) as Promise<Organization>,
      auth.api.hasPermission({
        headers: _headers,
        body: { permissions: { organization: ['update'] } }
      }) as Promise<{ success: boolean; error: unknown | null }>
    ])

    const hasPermission =
      perm.status === 'fulfilled' && perm.value.success === true

    return {
      ok: true,
      data: {
        organization:
          organization.status === 'fulfilled'
            ? (organization.value as Organization)
            : ({} as Organization),
        hasPermission
      }
    }
  } catch (error) {
    const { code, message } = mapError(error)
    return { ok: false, code, message }
  }
}

export async function getTeamMembers(): Promise<R<MemberRow[]>> {
  try {
    const _headers = await headers()
    const _session = await auth.api.getSession({ headers: _headers })
    return {
      ok: true,
      data: await _getTeamMembersCached(
        _headers,
        _session?.session?.activeOrganizationId ?? '',
        _session?.session?.userId
      )
    }
  } catch (error) {
    const { code, message } = mapError(error)
    return { ok: false, code, message }
  }
}

export async function getTeamInvitations(): Promise<R<InvitationRow[]>> {
  try {
    const _headers = await headers()
    const session = await auth.api.getSession({ headers: _headers })
    const orgId = session?.session?.activeOrganizationId ?? ''
    const userId = session?.session?.userId

    const rows = await _getTeamInvitationsCached(_headers, orgId, userId)
    return { ok: true as const, data: rows }
  } catch (e: any) {
    const { code, message } = mapError(e)
    return { ok: false, code, message }
  }
}
