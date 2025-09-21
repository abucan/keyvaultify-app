/* eslint-disable @typescript-eslint/no-unused-vars */
// src/server/settings.actions.ts
'use server'
import { headers } from 'next/headers'
import { redirect, unauthorized } from 'next/navigation'

import { auth } from '@/lib/better-auth/auth'
import { mapError } from '@/lib/errors/mapError'
import { profileFormSchema } from '@/lib/zod-schemas/form-schema'
import { R } from '@/types/result'

export async function updateUserProfileAction(fd: FormData): Promise<R> {
  const input = {
    name: String(fd.get('name') ?? '').trim(),
    image: String(fd.get('image') ?? '').trim()
  }

  if (!profileFormSchema.safeParse(input).success) {
    return { ok: false, code: 'INVALID_INPUT' }
  }

  try {
    const _headers = await headers()
    const session = await auth.api.getSession({
      headers: _headers
    })
    if (!session) {
      unauthorized()
    }

    await auth.api.updateUser({
      headers: _headers,
      body: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.image ? { image: input.image } : {})
      }
    })

    return { ok: true }
  } catch (error) {
    const { code, message } = mapError(error)
    return { ok: false, code, message }
  }
}

export async function deleteUserProfileAction(
  _prevState?: R | undefined,
  _formData?: FormData
): Promise<R> {
  try {
    const _headers = await headers()
    const session = await auth.api.getSession({
      headers: _headers
    })
    if (!session) {
      unauthorized()
    }

    await auth.api.deleteUser({
      headers: _headers,
      body: { callbackURL: '/signin' }
    })

    return { ok: true }
  } catch (error) {
    const { code, message } = mapError(error)
    return { ok: false, code, message }
  }
}
