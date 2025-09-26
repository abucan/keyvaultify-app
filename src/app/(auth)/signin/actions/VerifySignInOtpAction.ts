// src/app/(auth)/signin/actions/VerifySignInOtpAction.ts
'use server'

import { redirect } from 'next/navigation'

import { verifySignInWithOtp } from '@/app/(auth)/signin/data/auth.mutations'
import { safeNextPath } from '@/app/(auth)/signin/utils/safe-next'
import { BusinessError } from '@/lib/errors/business-error'
import { R } from '@/types/result'

export async function verifySignInOtpAction(fd: FormData): Promise<R> {
  const input = {
    email: String(fd.get('email') ?? '').trim(),
    otp: String(fd.get('otp') ?? '').trim(),
    next: safeNextPath(fd.get('next'), '/dashboard')
  }

  try {
    await verifySignInWithOtp(input.email, input.otp)
  } catch (error) {
    return {
      ok: false,
      code: (error as BusinessError)?.code ?? 'UNKNOWN',
      message: (error as BusinessError)?.message ?? 'Unexpected error'
    }
  }

  redirect(input.next)
}
