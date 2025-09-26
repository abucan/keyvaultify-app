// src/app/(auth)/signin/actions/SignInWithOtpAction.ts
'use server'

import { sendSignInWithOtp } from '@/app/(auth)/signin/data/auth.mutations'
import { BusinessError } from '@/lib/errors/business-error'
import { R } from '@/types/result'

export async function signInWithOtpAction(fd: FormData): Promise<R> {
  const email = String(fd.get('email') ?? '').trim()
  try {
    await sendSignInWithOtp(email)
    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      code: (error as BusinessError)?.code ?? 'UNKNOWN',
      message: (error as BusinessError)?.message ?? 'Unexpected error'
    }
  }
}
