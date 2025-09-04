// src/types/auth.ts
export type Role = 'owner' | 'admin' | 'member'
export type InviteStatus = 'accepted' | 'canceled' | 'rejected' | 'pending'

export type Team = {
  id: string
  name: string
  createdAt: Date
  slug: string
  metadata?: Record<string, unknown>
  logo?: string | null | undefined
}

export type Member = {
  id: string
  name: string
  email: string
  image: string
  joinedAt: string
  role: string
}

export type MemberRow = Member & {
  _acl: {
    canEditRole: boolean
    canRemove: boolean
    canLeave: boolean
  }
  _meta: {
    hasOtherOwners: boolean
    isSelf: boolean
    isOwner: boolean
    isPersonalOrg: boolean
  }
}

export type InviteRow = {
  id: string
  email: string
  role: Role
  status: InviteStatus
  expiresAt: string
  organizationId: string
  inviterId: string
}

export type InvitationRow = {
  id: string
  email: string
  role: 'member' | 'admin' | 'owner'
  expiresAt: string
  status?: string
  acceptUrl: string
  _acl: {
    canResend: boolean
    canCancel: boolean
    canCopy: boolean
  }
}

export type Result<T extends string = string> =
  | { ok: true }
  | { ok: false; code: T | 'INVALID_INPUT' | 'NOT_AUTHORIZED' | 'UNKNOWN' }

export type Organization = {
  id: string
  name: string
  slug: string
  logo: string
  billing_email: string
  default_role: string
  updateTeamSettings: (values: FormData) => Promise<Result>
}
