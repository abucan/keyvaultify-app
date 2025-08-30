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
  currentUserRole: Role | null
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
