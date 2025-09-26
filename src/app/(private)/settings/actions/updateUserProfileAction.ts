// src/app/(private)/settings/actions/updateUserProfileAction.ts
'use server'

import { updateUserProfile } from '@/app/(private)/settings/data/settings.mutations'
import { BusinessError } from '@/lib/errors/business-error'
import { R } from '@/types/result'

export async function updateUserProfileAction(fd: FormData): Promise<R> {
  try {
    const input = {
      name: String(fd.get('name') ?? '').trim(),
      image: String(fd.get('image') ?? '').trim()
    }
    await updateUserProfile(input.name, input.image)
    return { ok: true }
  } catch (error: any) {
    return {
      ok: false,
      code: (error as BusinessError)?.code ?? 'UNKNOWN',
      message: (error as BusinessError)?.message ?? 'Unexpected error'
    }
  }
}
