// src/lib/auth/profile.ts
import 'server-only'

import { headers } from 'next/headers'
import { unauthorized } from 'next/navigation'

import { auth } from '@/lib/better-auth/auth'
import { R } from '@/types/api-results'

import { mapError } from '../errors/mapError'

export async function updateUserProfile({
  image,
  name
}: {
  image?: string
  name?: string
}) {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (!session) {
    unauthorized()
  }

  await auth.api.updateUser({
    body: {
      ...(name ? { name } : {}),
      ...(image ? { image } : {})
    },
    headers: await headers()
  })
}

export async function deleteUserProfile(): Promise<R> {
  const _headers = await headers()
  try {
    const session = await auth.api.getSession({ headers: _headers })
    if (!session?.user) {
      return { ok: false, code: 'UNAUTHORIZED', message: 'Please sign in.' }
    }

    // BetterAuth will clear session. We’ll handle redirect on client.
    await auth.api.deleteUser({
      headers: _headers,
      body: { callbackURL: '/signin' }
    })

    return { ok: true }
  } catch (e) {
    // BetterAuth errors: e.body = { code: '...', message: '...' }
    const { code, message } = mapError(e)
    return { ok: false, code, message }
  }
}
