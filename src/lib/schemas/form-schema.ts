import { z } from 'zod'

export const baseAuthSchema = z.object({
  email: z.email('Please enter a valid email address')
})

export const otpVerificationSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  otp: z.string().length(6, 'Verification code must be 6 digits')
})

export type BaseAuthSchema = z.infer<typeof baseAuthSchema>
export type OtpVerificationSchema = z.infer<typeof otpVerificationSchema>
