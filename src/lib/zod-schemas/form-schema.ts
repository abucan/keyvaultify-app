// src/lib/zod-schemas/form-schema.ts
import { z } from 'zod'

export const authFormSchema = z
  .object({
    email: z.email(),
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

export const emailOnlySchema = authFormSchema.pick({ email: true })
export const otpOnlySchema = authFormSchema.pick({ otp: true })
export type AuthFormData = z.infer<typeof authFormSchema>
