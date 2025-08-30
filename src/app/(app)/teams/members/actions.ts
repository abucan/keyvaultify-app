// src/app/(app)/teams/members/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

import { auth } from '@/lib/better-auth/auth'
import { mapToInviteRows, mapToMembers } from '@/lib/utils/helpers'
import { getMyRole } from '@/lib/teams/acl'
import { Role } from '@/types/auth'

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

export async function updateMemberRoleAction(formData: FormData) {
  const memberId = String(formData.get('memberId') ?? '')
  const role = String(formData.get('role') ?? 'member')
  if (!memberId) throw new Error('Missing memberId')
  await auth.api.updateMemberRole({
    headers: await headers(),
    body: { memberId, role: role as 'member' | 'admin' | 'owner' }
  })
  revalidatePath('/teams/members')
}

export async function removeMemberAction(formData: FormData) {
  const memberIdOrEmail = String(formData.get('memberIdOrEmail') ?? '')
  if (!memberIdOrEmail) throw new Error('Missing memberIdOrEmail')
  await auth.api.removeMember({
    headers: await headers(),
    body: { memberIdOrEmail }
  })
  revalidatePath('/teams/members')
}

// server-side lists for your page
export async function listTeamMembers() {
  const members =
    (await auth.api.getFullOrganization({ headers: await headers() }))
      ?.members ?? []

  const currentUserRole = await getMyRole()

  return mapToMembers(members, currentUserRole as Role)
}

export async function listInvitations() {
  const data =
    (await auth.api.listInvitations({ headers: await headers() })) ?? []

  return mapToInviteRows(data)
}
