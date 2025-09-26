// src/app/(private)/settings/data/settings.mutations.ts
import 'server-only'

import { headers } from 'next/headers'

import { auth } from '@/lib/better-auth/auth'
import { BusinessError } from '@/lib/errors/business-error'
import { mapError } from '@/lib/errors/mapError'
import { profileFormSchema } from '@/lib/zod-schemas/form-schema'

export async function updateUserProfile(
  name: string,
  image: string
): Promise<void> {
  const parsedInput = profileFormSchema.safeParse({ name, image })
  if (!parsedInput.success) {
    throw new BusinessError(
      'INVALID_INPUT',
      'Please provide a valid name and image.'
    )
  }

  const _headers = await headers()

  try {
    await auth.api.updateUser({
      headers: _headers,
      body: {
        ...(parsedInput.data.username
          ? { name: parsedInput.data.username }
          : {}),
        ...(parsedInput.data.image ? { image: parsedInput.data.image } : {})
      }
    })
  } catch (error: any) {
    const { code, message } = mapError(error)
    throw new BusinessError(code, message ?? 'Unexpected error')
  }
}

export async function deleteUserProfile(): Promise<void> {
  const _headers = await headers()
  try {
    await auth.api.deleteUser({
      headers: _headers,
      body: { callbackURL: '/signin' }
    })
  } catch (error: any) {
    const { code, message } = mapError(error)
    throw new BusinessError(code, message ?? 'Unexpected error')
  }
}
