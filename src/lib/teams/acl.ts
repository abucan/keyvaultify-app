/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/teams/acl.ts
import 'server-only'

import { headers } from 'next/headers'

import { auth } from '@/lib/better-auth/auth'

type Role = 'owner' | 'admin' | 'member'

export async function getMyRole(): Promise<Role | null> {
  const organization = await auth.api.getFullOrganization({
    headers: await headers()
  })

  if (!organization || !organization?.members) return null

  // BetterAuth includes the caller in members; find my role
  const session = await auth.api.getSession({ headers: await headers() })
  const me = organization?.members.find(
    (m: any) => m.userId === session?.session?.userId
  )
  return (me?.role as Role) ?? null
}

export async function requireRole(allowed: Role[]) {
  const role = await getMyRole()
  if (!role || !allowed.includes(role)) {
    // keep error neutral for security; surface a friendly message in UI
    throw new Error('NOT_AUTHORIZED')
  }
  return role
}

/** Ensure we never remove/demote the last owner. */
export async function ensureOwnerSafety(
  targetMemberId?: string,
  nextRole?: Role
) {
  const full = await auth.api.getFullOrganization({ headers: await headers() })
  const members = full?.members ?? []
  const owners = members.filter((m: any) => m.role === 'owner')
  const target = members.find((m: any) => m.id === targetMemberId)

  // If removing an owner, require at least 2 owners
  if (target && target.role === 'owner') {
    if (owners.length <= 1) throw new Error('LAST_OWNER_PROTECTED')
  }
  // If changing role of an owner to non-owner, same guard
  if (target && target.role === 'owner' && nextRole && nextRole !== 'owner') {
    if (owners.length <= 1) throw new Error('LAST_OWNER_PROTECTED')
  }
}
