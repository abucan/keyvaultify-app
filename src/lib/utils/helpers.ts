// src/lib/utils/helpers.ts

import { InviteRow, Member, Role } from '@/types/auth'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapToMembers(data: any[], currentUserRole: Role): Member[] {
  return data.map(item => ({
    id: item.id,
    name: item.user.name,
    email: item.user.email,
    image: item.user.image,
    joinedAt: new Date(item.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    role: item.role,
    currentUserRole: currentUserRole
  }))
}

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
