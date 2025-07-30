'use server'

import { db } from '@/lib/db'
import { user } from '@/lib/schemas/auth-schema'
import { eq } from 'drizzle-orm'

const checkEmail = async (email: string): Promise<boolean> => {
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

export { checkEmail }
