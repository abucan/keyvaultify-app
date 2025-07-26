import { z } from 'zod'

const baseAuthSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const signInSchema = baseAuthSchema

export const signUpSchema = baseAuthSchema.extend({
  name: z.string().min(2, 'Name must be at least 2 characters'),
})

export type SignInFormData = z.infer<typeof signInSchema>
export type SignUpFormData = z.infer<typeof signUpSchema>
