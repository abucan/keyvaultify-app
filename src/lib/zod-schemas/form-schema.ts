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

export const addTeamFormSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(3)
})

export const emailOnlySchema = authFormSchema.pick({ email: true })
export const otpOnlySchema = authFormSchema.pick({ otp: true })
export type AuthFormData = z.infer<typeof authFormSchema>
export type AddTeamFormData = z.infer<typeof addTeamFormSchema>
