// src/app/(auth)/signin/data/auth.mutations.ts
import 'server-only'

import { headers } from 'next/headers'

import { auth } from '@/lib/better-auth/auth'
import { BusinessError } from '@/lib/errors/business-error'
import { mapError } from '@/lib/errors/mapError'
import { emailOnlySchema, otpOnlySchema } from '@/lib/zod-schemas/form-schema'

export async function sendSignInWithOtp(email: string): Promise<void> {
  const parsedInput = emailOnlySchema.safeParse({ email })
  if (!parsedInput.success) {
    throw new BusinessError('INVALID_INPUT', 'Invalid email')
  }
  try {
    await auth.api.sendVerificationOTP({
      headers: await headers(),
      body: { email, type: 'sign-in' }
    })
  } catch (error) {
    const { code, message } = mapError(error)
    throw new BusinessError(code, message ?? 'Unexpected error')
  }
}

export async function verifySignInWithOtp(
  email: string,
  otp: string
): Promise<void> {
  const parsedEmail = emailOnlySchema.safeParse({ email })
  const parsedOtp = otpOnlySchema.safeParse({ otp })
  if (!parsedEmail.success) {
    throw new BusinessError('INVALID_INPUT', 'Invalid email')
  }
  if (!parsedOtp.success) {
    throw new BusinessError('INVALID_INPUT', 'Invalid OTP')
  }

  try {
    await auth.api.signInEmailOTP({
      headers: await headers(),
      body: {
        email: parsedEmail.data.email,
        otp: parsedOtp.data.otp
      }
    })
  } catch (error) {
    const { code, message } = mapError(error)
    throw new BusinessError(code, message ?? 'Unexpected error')
  }
}
