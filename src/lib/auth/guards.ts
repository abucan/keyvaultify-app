import 'server-only'

import { headers } from 'next/headers'

import { auth } from '@/lib/auth'

export async function requireOwner() {
  const member = await auth.api.getActiveMember({
    headers: await headers()
  })

  const roles = Array.isArray(member?.role) ? member!.role : [member?.role]

  if (!roles?.includes('owner')) {
    throw new Error('Forbidden')
  }

  return member
}
