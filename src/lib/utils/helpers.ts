// src/lib/utils/helpers.ts

import { InviteRow, Member, MemberRow, Role } from '@/types/auth'

/* export function mapToMemberRow(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any,
  ctx: {
    currentRole: Role
    currentUserId: string | null
    hasOtherOwners: boolean
  }
): MemberRow {
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
  const isSelf = !!ctx.currentUserId && item.userId === ctx.currentUserId

  // Owners can edit anyone; Admins can edit everyone except Owners; Members cannot edit
  const canEditRole =
    ctx.currentRole === 'owner' || (ctx.currentRole === 'admin' && !isOwner)

  return {
    ...base,
    _acl: { canEditRole },
    _meta: {
      hasOtherOwners: ctx.hasOtherOwners,
      isSelf,
      isOwner
    }
  }
} */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapToInviteRows(data: any[]): InviteRow[] {
  return data.map(i => ({
    id: i.id,
    email: i.email,
    role: i.role,
    status: i.status,
    expiresAt: new Date(i.expiresAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    organizationId: i.organizationId,
    inviterId: i.inviterId
  }))
}

export function requireAdminOrOwner(role: Role) {
  return role === 'admin' || role === 'owner'
}
