// src/lib/auth/user.ts
import 'server-only'

import { eq } from 'drizzle-orm'

import { user } from '@/db/schemas/auth-schema'
import { db } from '@/lib/db'

export async function checkEmail(email: string): Promise<boolean> {
  try {
    const existingUser = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, email))

    return existingUser.length > 0
  } catch (error) {
    console.error('Error checking user existence:', error)
    throw new Error('Failed to check user existence')
  }
}
