// src/lib/zod-schemas/form-schema.ts
import { z } from 'zod'

export const authFormSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    otp: z.string().optional()
  })
  .refine(
    data => {
      if (data.otp !== undefined && data.otp !== '') {
        return data.otp.length === 6
      }
      return true
    },
    {
      message: 'Verification code must be 6 digits',
      path: ['otp']
    }
  )

export const emailStepSchema = z.object({
  email: z.string().email('Please enter a valid email address')
})

export const otpStepSchema = z.object({
  otp: z.string().length(6, 'Verification code must be 6 digits')
})

export type EmailStepData = z.infer<typeof emailStepSchema>
export type OTPStepData = z.infer<typeof otpStepSchema>
export type AuthFormData = z.infer<typeof authFormSchema>
