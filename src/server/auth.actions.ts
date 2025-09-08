/* eslint-disable @typescript-eslint/no-explicit-any */
// src/server/auth.actions.ts
'use server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/better-auth/auth'
import { emailOnlySchema, otpOnlySchema } from '@/lib/zod-schemas/form-schema'
import { OTPSignInResult } from '@/types/api-results'

export async function sendSignInWithOtp(
  fd: FormData
): Promise<OTPSignInResult> {
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
    const msg = String(e?.message || '')
    if (msg.toLowerCase().includes('rate'))
      return { ok: false, code: 'RATE_LIMITED' }
    if (msg.includes('403')) return { ok: false, code: 'NOT_AUTHORIZED' }
    return { ok: false, code: 'UNKNOWN' }
  }
}

export async function verifySignInWithOtp(
  fd: FormData
): Promise<OTPSignInResult> {
  const email = String(fd.get('email') ?? '').trim()
  const otp = String(fd.get('otp') ?? '').trim()

  if (!emailOnlySchema.safeParse({ email }).success)
    return { ok: false, code: 'INVALID_EMAIL' }
  if (!otpOnlySchema.safeParse({ otp }).success)
    return { ok: false, code: 'INVALID_OTP' }

  try {
    await auth.api.signInEmailOTP({
      headers: await headers(),
      body: {
        email,
        otp
      }
    })
  } catch (e: any) {
    const msg = String(e?.message || '')
    if (msg.toLowerCase().includes('expired'))
      return { ok: false, code: 'OTP_EXPIRED' }
    if (msg.toLowerCase().includes('invalid'))
      return { ok: false, code: 'INVALID_OTP' }
    if (msg.includes('403')) return { ok: false, code: 'NOT_AUTHORIZED' }
    return { ok: false, code: 'UNKNOWN' }
  }

  redirect('/dashboard')
}
