/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(app)/teams/members/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

import { auth } from '@/lib/better-auth/auth'
import { ensureOwnerSafety } from '@/lib/teams/acl'
import { mapToInviteRows } from '@/lib/utils/helpers'
import { Member, MemberRow, Role } from '@/types/auth'

type ActionResult =
  | { ok: true }
  | {
      ok: false
      code:
        | 'LAST_OWNER_PROTECTED'
        | 'NOT_AUTHORIZED'
        | 'INVALID_INPUT'
        | 'UNKNOWN'
    }

export async function inviteMemberAction(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const role = String(formData.get('role') ?? 'member')
  if (!email) throw new Error('Missing email')

  await auth.api.createInvitation({
    headers: await headers(),
    body: { email, role: role as 'member' | 'admin' | 'owner' } // defaults to active org
  }) // POST /organization/invite-member
  revalidatePath('/teams/members')
}

export async function cancelInvitationAction(formData: FormData) {
  const invitationId = String(formData.get('invitationId') ?? '')
  if (!invitationId) throw new Error('Missing invitationId')
  await auth.api.cancelInvitation({
    headers: await headers(),
    body: { invitationId }
  })
  revalidatePath('/teams/members')
}

export async function updateMemberRoleAction(
  formData: FormData
): Promise<ActionResult> {
  const memberId = String(formData.get('memberId') ?? '')
  const role = String(formData.get('role') ?? 'member')
  if (!memberId) return { ok: false, code: 'INVALID_INPUT' }

  try {
    await ensureOwnerSafety(memberId, role as Role)
    await auth.api.updateMemberRole({
      headers: await headers(),
      body: { memberId, role: role as 'member' | 'admin' | 'owner' }
    })
    revalidatePath('/teams/members')
    return { ok: true }
  } catch (e: any) {
    if (e?.message === 'LAST_OWNER_PROTECTED')
      return { ok: false, code: 'LAST_OWNER_PROTECTED' }
    if (e?.message === 'NOT_AUTHORIZED')
      return { ok: false, code: 'NOT_AUTHORIZED' }
    return { ok: false, code: 'UNKNOWN' }
  }
}

export async function removeMemberAction(
  formData: FormData
): Promise<ActionResult> {
  const memberIdOrEmail = String(formData.get('memberId') ?? '')
  if (!memberIdOrEmail) return { ok: false, code: 'INVALID_INPUT' }
  console.log('removeMemberAction', memberIdOrEmail)

  try {
    await ensureOwnerSafety(memberIdOrEmail)
    await auth.api.removeMember({
      headers: await headers(),
      body: { memberIdOrEmail }
    })
    revalidatePath('/teams/members')
    return { ok: true }
  } catch (e: any) {
    if (e?.message === 'LAST_OWNER_PROTECTED')
      return { ok: false, code: 'LAST_OWNER_PROTECTED' }
    if (e?.message === 'NOT_AUTHORIZED')
      return { ok: false, code: 'NOT_AUTHORIZED' }
    return { ok: false, code: 'UNKNOWN' }
  }
}

export async function leaveTeamAction(): Promise<ActionResult> {
  try {
    // Guard: if the caller is the ONLY owner, block
    const full = await auth.api.getFullOrganization({
      headers: await headers()
    })
    const members = full?.members ?? []
    const session = await auth.api.getSession({ headers: await headers() })
    const me = members.find((m: any) => m.userId === session?.session?.userId)

    const owners = members.filter((m: any) => m.role === 'owner')
    const isSoleOwner = me?.role === 'owner' && owners.length <= 1
    if (isSoleOwner) return { ok: false, code: 'LAST_OWNER_PROTECTED' }

    await auth.api.leaveOrganization({
      headers: await headers(),
      body: { organizationId: full?.id ?? '' }
    })
    // TODO: if they leave, set active organization to the first one
    revalidatePath('/teams/members')
    return { ok: true }
  } catch (e: any) {
    if (e?.message === 'NOT_AUTHORIZED')
      return { ok: false, code: 'NOT_AUTHORIZED' }
    return { ok: false, code: 'UNKNOWN' }
  }
}

export async function listTeamMembers(): Promise<MemberRow[]> {
  const hdrs = await headers()

  const [full, session] = await Promise.all([
    auth.api.getFullOrganization({ headers: hdrs }),
    auth.api.getSession({ headers: hdrs })
  ])

  const raw = full?.members ?? []
  const currentUserId = session?.session?.userId ?? null
  const me = raw.find((m: any) => m.userId === currentUserId)
  const myRole = (me?.role as Role) ?? 'member'

  const ownersCount = raw.filter((m: any) => m.role === 'owner').length
  const hasOtherOwners = ownersCount > 1

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
    const isSelf = !!currentUserId && item.userId === currentUserId

    const canEditRole = myRole === 'owner' || (myRole === 'admin' && !isOwner)

    // Remove rules:
    // - Owner: can remove anyone EXCEPT the last remaining owner (server enforces; we gate UI when ownersCount <= 1 && target is owner)
    // - Admin: cannot remove owners
    // - Member: cannot remove anyone
    const canRemove =
      myRole === 'owner'
        ? !isOwner || hasOtherOwners // if target is owner, need >1 owners
        : myRole === 'admin'
          ? !isOwner
          : false

    // Leave rules:
    // - You can leave your own row
    // - If you’re an owner, you can only leave if there are other owners
    const canLeave = isSelf && (!isOwner || hasOtherOwners)

    return {
      ...base,
      _acl: { canEditRole, canRemove, canLeave },
      _meta: { hasOtherOwners, isSelf, isOwner }
    } satisfies MemberRow
  })
}

export async function listInvitations() {
  const data =
    (await auth.api.listInvitations({ headers: await headers() })) ?? []

  return mapToInviteRows(data)
}
