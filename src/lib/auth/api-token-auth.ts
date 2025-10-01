// src/lib/auth/api-token-auth.ts
import 'server-only'

import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'

import { apiTokens } from '@/db/schemas/app-schema'
import { auth } from '@/lib/better-auth/auth'
import { hashToken, isValidTokenFormat } from '@/lib/auth/api-token'
import { updateTokenLastUsed } from '@/app/(private)/settings/developer/data/tokens.mutations'
import { db } from '@/lib/sqlite-db'

export type ApiTokenContext = {
  organizationId: string
  projectId: string | null
  userId: string
  role: 'owner' | 'admin' | 'member'
  canRead: boolean
  canWrite: boolean
}

/**
 * Validates an API token and returns context
 * @param token The Bearer token from Authorization header
 * @returns ApiTokenContext if valid, null if invalid
 */
export async function validateApiToken(
  token: string
): Promise<ApiTokenContext | null> {
  try {
    // Validate token format
    if (!isValidTokenFormat(token)) {
      return null
    }

    // Hash the token to lookup in database
    const tokenHash = hashToken(token)

    // Find token in database
    const tokenRecord = await db.query.apiTokens.findFirst({
      where: eq(apiTokens.tokenHash, tokenHash)
    })

    if (!tokenRecord) {
      return null
    }

    // Check if token is expired
    if (tokenRecord.expiresAt) {
      const now = new Date()
      if (new Date(tokenRecord.expiresAt) < now) {
        return null // Token expired
      }
    }

    // Get the user who created the token and their current role
    const full = await auth.api.getFullOrganization({
      headers: await headers(),
      query: { organizationId: tokenRecord.organizationId }
    })

    if (!full) {
      return null
    }

    // Find the creator's current role in the organization
    const member = full.members?.find(
      (m: any) => m.userId === tokenRecord.createdBy
    )

    if (!member) {
      return null // Creator no longer in organization
    }

    const role = member.role as 'owner' | 'admin' | 'member'

    // Update lastUsed timestamp (fire and forget)
    updateTokenLastUsed(tokenHash).catch(() => {})

    // Return context with dynamic permissions based on current role
    return {
      organizationId: tokenRecord.organizationId,
      projectId: tokenRecord.projectId,
      userId: tokenRecord.createdBy,
      role,
      canRead: true, // All roles can read
      canWrite: role === 'owner' || role === 'admin' // Only admin/owner can write
    }
  } catch (error) {
    console.error('Token validation error:', error)
    return null
  }
}

/**
 * Extracts Bearer token from Authorization header
 * @param request The request object
 * @returns The token string or null if not found
 */
export function extractBearerToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  return authHeader.substring(7) // Remove 'Bearer ' prefix
}
