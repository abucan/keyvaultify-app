// src/app/(private)/team/_utils/acl.ts
import 'server-only'

import { headers } from 'next/headers'

import { auth } from '@/lib/better-auth/auth'
import { BusinessError } from '@/lib/errors/business-error'
import { R } from '@/types/result'

export async function getMyRole(): Promise<'owner' | 'admin' | 'member'> {
  const _headers = await headers()
  const org = await auth.api.getActiveMember({ headers: _headers })
  if (!org || !org.role) {
    throw new BusinessError('UNAUTHORIZED', 'No active member role')
  }
  return org.role as 'owner' | 'admin' | 'member'
}

export async function requireRole(
  roles: Array<'owner' | 'admin' | 'member'>
): Promise<R<'owner' | 'admin' | 'member'>> {
  const role = await getMyRole()
  if (!roles.includes(role)) {
    return {
      ok: false,
      code: 'UNAUTHORIZED',
      message: 'You do not have permission to perform this action'
    }
  }
  return { ok: true, data: role }
}

export async function ensureOwnerSafety(
  targetMemberId: string,
  nextRole?: 'owner' | 'admin' | 'member'
): Promise<R<void>> {
  const _headers = await headers()
  const full = await auth.api.getFullOrganization({ headers: _headers })
  if (!full || !full.members) {
    throw new BusinessError('UNAUTHORIZED', 'No active organization')
  }

  const members = full?.members ?? []
  const owners = members.filter((m: any) => m.role === 'owner')
  const target = members.find((m: any) => m.id === targetMemberId)

  if (target && target.role === 'owner') {
    if (owners.length <= 1) return { ok: false, code: 'LAST_OWNER_PROTECTED' }
  }

  if (target && target.role === 'owner' && nextRole && nextRole !== 'owner') {
    if (owners.length <= 1) return { ok: false, code: 'LAST_OWNER_PROTECTED' }
  }
  return { ok: true }
}
