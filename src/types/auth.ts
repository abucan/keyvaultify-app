// src/types/auth.ts

export type Team = {
  id: string
  name: string
  createdAt: Date
  slug: string
  metadata?: Record<string, unknown>
  logo?: string | null | undefined
}
