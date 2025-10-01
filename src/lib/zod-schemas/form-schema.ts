// src/lib/zod-schemas/form-schema.ts
import { z } from 'zod'

export const authFormSchema = z.object({
  email: z.email(),
  otp: z.string({ message: 'Verification code must be 6 digits' })
})

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
  default_role: z.enum(['member', 'admin', 'owner']).optional()
})

export const addProjectFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  slug: z
    .string()
    .min(1)
    .max(50, 'Slug must be less than 50 characters')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug must contain only lowercase letters, numbers, and hyphens'
    )
    .optional()
})

export const addEnvironmentFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Environment name is required')
    .max(100, 'Environment name must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
})

export const addSecretFormSchema = z.object({
  key: z
    .string()
    .min(1, 'Secret key is required')
    .max(200, 'Secret key must be less than 200 characters')
    .regex(
      /^[A-Z0-9_]+$/,
      'Secret key must contain only uppercase letters, numbers, and underscores'
    ),
  value: z.string().min(1, 'Secret value is required')
})

export const emailOnlySchema = authFormSchema.pick({ email: true })
export const otpOnlySchema = authFormSchema.pick({ otp: true })

/* helper types */
export type AuthFormData = z.infer<typeof authFormSchema>
export type AddTeamFormData = z.infer<typeof addTeamFormSchema>
export type ProfileFormData = z.infer<typeof profileFormSchema>
export type AddMemberFormData = z.infer<typeof addMemberFormSchema>
export type TeamSettingsFormData = z.infer<typeof teamSettingsFormSchema>
export type AddProjectFormData = z.infer<typeof addProjectFormSchema>
export type AddEnvironmentFormData = z.infer<typeof addEnvironmentFormSchema>
export type AddSecretFormData = z.infer<typeof addSecretFormSchema>
