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

export const profileFormSchema = z.object({
  username: z.string().optional(),
  image: z.string().optional()
})

export const addMemberFormSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  role: z.enum(['member', 'admin', 'owner'])
})

export const teamSettingsFormSchema = z.object({
  name: z.string().optional(),
  slug: z.string().optional(),
  logo: z.string().optional(),
  default_role: z.string().optional()
})

export const emailOnlySchema = authFormSchema.pick({ email: true })
export const otpOnlySchema = authFormSchema.pick({ otp: true })

/* helper types */
export type AuthFormData = z.infer<typeof authFormSchema>
export type AddTeamFormData = z.infer<typeof addTeamFormSchema>
export type ProfileFormData = z.infer<typeof profileFormSchema>
export type AddMemberFormData = z.infer<typeof addMemberFormSchema>
export type TeamSettingsFormData = z.infer<typeof teamSettingsFormSchema>
