// src/app/(app)/teams/members/actions.ts
'use server'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { unauthorized } from 'next/navigation'

import { auth } from '@/lib/better-auth/auth'
import { mapError } from '@/lib/errors/mapError'
import { ensureOwnerSafety } from '@/lib/teams/acl'
import { addMemberFormSchema } from '@/lib/zod-schemas/form-schema'
import { Member, MemberRow, Role } from '@/types/auth'
import { R } from '@/types/result'

export async function inviteMemberAction(
  formData: FormData
): Promise<R<{ email: string }>> {
  const input = {
    email: String(formData.get('email') ?? '').trim(),
    role: String(formData.get('role') ?? 'member').trim()
  }

  const parsed = addMemberFormSchema.safeParse(input)
  if (!parsed.success)
    return {
      ok: false,
      code: 'INVALID_INPUT',
      message: 'Please provide a valid email and role.'
    }

  try {
    const email = parsed.data.email
    const role = parsed.data.role

    await auth.api.createInvitation({
      headers: await headers(),
      body: { email, role: role as 'member' | 'admin' | 'owner' }
    })
    revalidatePath('/teams/invitations')
    return { ok: true, data: { email } }
  } catch (error) {
    const { code, message } = mapError(error)
    return { ok: false, code, message }
  }
}

export async function updateMemberRoleAction(
  formData: FormData
): Promise<R<{ role: string }>> {
  const input = {
    memberId: String(formData.get('memberId') ?? '').trim(),
    role: String(formData.get('role') ?? 'member').trim()
  }

  if (!input.memberId) return { ok: false, code: 'INVALID_INPUT' }
  if (!input.role) input.role = 'member' as Role

  try {
    await ensureOwnerSafety(input.memberId, input.role as Role)
    await auth.api.updateMemberRole({
      headers: await headers(),
      body: {
        memberId: input.memberId,
        role: input.role as 'member' | 'admin' | 'owner'
      }
    })
    revalidatePath('/teams/members')
    return { ok: true, data: { role: input.role } }
  } catch (e: any) {
    const { code, message } = mapError(e)
    return { ok: false, code, message }
  }
}

export async function removeMemberAction(formData: FormData): Promise<R> {
  const memberIdOrEmail = String(formData.get('memberId') ?? '').trim()
  if (!memberIdOrEmail) return { ok: false, code: 'INVALID_INPUT' }

  try {
    const _headers = await headers()
    const session = await auth.api.getSession({ headers: _headers })
    if (!session) unauthorized()

    await ensureOwnerSafety(memberIdOrEmail)
    await auth.api.removeMember({
      headers: _headers,
      body: { memberIdOrEmail }
    })
    revalidatePath('/teams/members')
    return { ok: true }
  } catch (e: any) {
    const { code, message } = mapError(e)
    return { ok: false, code, message }
  }
}

export async function leaveTeamAction(): Promise<R> {
  try {
    const _headers = await headers()
    // Guard: if the caller is the ONLY owner, block
    const full = await auth.api.getFullOrganization({
      headers: _headers
    })
    const members = full?.members ?? []
    const session = await auth.api.getSession({ headers: _headers })

    if (!session) unauthorized()

    const me = members.find((m: any) => m.userId === session?.session?.userId)
    const owners = members.filter((m: any) => m.role === 'owner')
    const isSoleOwner = me?.role === 'owner' && owners.length <= 1

    if (isSoleOwner) return { ok: false, code: 'LAST_OWNER_PROTECTED' }

    await auth.api.leaveOrganization({
      headers: _headers,
      body: { organizationId: full?.id ?? '' }
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
    return { ok: true }
  } catch (e: any) {
    const { code, message } = mapError(e)
    return { ok: false, code, message }
  }
}

export async function listTeamMembers(): Promise<R<MemberRow[]>> {
  try {
    const _headers = await headers()

    const [full, session] = await Promise.all([
      auth.api.getFullOrganization({ headers: _headers }),
      auth.api.getSession({ headers: _headers })
    ])

    const raw = full?.members ?? []
    const currentUserId = session?.session?.userId ?? null
    const me = raw.find((m: any) => m.userId === currentUserId)
    const myRole = (me?.role as Role) ?? 'member'

    const ownersCount = raw.filter((m: any) => m.role === 'owner').length
    const hasOtherOwners = ownersCount > 1

    const metadata = JSON.parse(full?.metadata ?? '{}')

    const isPersonalOrg = metadata?.isPersonal ?? false
    const defaultRole = metadata?.default_role ?? 'member'

    return {
      ok: true,
      data: raw.map((item: any) => {
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

        const canEditRole =
          myRole === 'owner' || (myRole === 'admin' && !isOwner)
        const canSetOwner = myRole === 'owner'

        const canRemove =
          !isSelf &&
          (myRole === 'owner'
            ? !isOwner || hasOtherOwners // owners can remove anyone except the last remaining owner
            : myRole === 'admin'
              ? !isOwner // admins can remove non-owners
              : false) // members can't remove anyone

        // Leave rules:
        // - You can leave your own row
        // - If you’re an owner, you can only leave if there are other owners
        const canLeave = isSelf && (!isOwner || hasOtherOwners)

        return {
          ...base,
          _acl: { canEditRole, canRemove, canLeave, canSetOwner },
          _meta: { hasOtherOwners, isSelf, isOwner, isPersonalOrg, defaultRole }
        } satisfies MemberRow
      })
    }
  } catch (e: any) {
    const { code, message } = mapError(e)
    return { ok: false, code, message }
  }
}
