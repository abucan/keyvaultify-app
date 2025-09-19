// src/server/auth.actions.ts
'use server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/better-auth/auth'
import { mapError } from '@/lib/errors/mapError'
import { emailOnlySchema, otpOnlySchema } from '@/lib/zod-schemas/form-schema'
import { R } from '@/types/result'

export async function sendSignInWithOtp(fd: FormData): Promise<R> {
  const email = String(fd.get('email') ?? '').trim()
  if (!emailOnlySchema.safeParse({ email }).success)
    return { ok: false, code: 'INVALID_EMAIL' }

  try {
    await auth.api.sendVerificationOTP({
      headers: await headers(),
      body: { email, type: 'sign-in' }
    })
    return { ok: true }
  } catch (e: any) {
    const { code, message } = mapError(e)
    return { ok: false, code, message }
  }
}

export async function verifySignInWithOtp(fd: FormData): Promise<R> {
  const input = {
    email: String(fd.get('email') ?? '').trim(),
    otp: String(fd.get('otp') ?? '').trim(),
    next: String(fd.get('next') ?? '/dashboard').trim()
  }

  if (!emailOnlySchema.safeParse({ email: input.email }).success)
    return { ok: false, code: 'INVALID_EMAIL' }
  if (!otpOnlySchema.safeParse({ otp: input.otp }).success)
    return { ok: false, code: 'INVALID_OTP' }

  try {
    await auth.api.signInEmailOTP({
      headers: await headers(),
      body: {
        email: input.email,
        otp: input.otp
      }
    })
  } catch (e: any) {
    const { code, message } = mapError(e)
    return { ok: false, code, message }
  }

  const dest =
    input.next.startsWith('/') && !input.next.startsWith('//')
      ? input.next
      : '/dashboard'
  redirect(dest)
}
