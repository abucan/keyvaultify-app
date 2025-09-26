/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/(private)/settings/actions/deleteUserProfileAction.ts
'use server'

import { deleteUserProfile } from '@/app/(private)/settings/data/settings.mutations'
import { BusinessError } from '@/lib/errors/business-error'
import { R } from '@/types/result'

export async function deleteUserProfileAction(
  _prevState?: R | undefined,
  _formData?: FormData
): Promise<R> {
  try {
    await deleteUserProfile()
    return { ok: true }
  } catch (error: any) {
    return {
      ok: false,
      code: (error as BusinessError)?.code ?? 'UNKNOWN',
      message: (error as BusinessError)?.message ?? 'Unexpected error'
    }
  }
}
