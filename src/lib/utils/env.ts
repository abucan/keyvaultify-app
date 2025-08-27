// src/lib/utils/env.ts
import 'server-only'

import { z } from 'zod'

const envSchema = z.object({
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  NEXT_PUBLIC_APP_URL: z.string().url()
})

export const env = envSchema.parse(process.env)
