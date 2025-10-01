// src/app/(private)/settings/developer/data/tokens.mutations.ts
import 'server-only'

import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidateTag } from 'next/cache'

import { apiTokens, type NewApiToken } from '@/db/schemas/app-schema'
import { auth } from '@/lib/better-auth/auth'
import {
  generateToken,
  generateTokenPrefix,
  hashToken
} from '@/lib/auth/api-token'
import { BusinessError } from '@/lib/errors/business-error'
import { mapError } from '@/lib/errors/mapError'
import { db } from '@/lib/sqlite-db'

import { API_TOKENS_TAG } from './tokens.tags'

/**
 * Creates a new API token
 * @param name Token name/description
 * @param projectId Optional project ID to scope token to
 * @param expiresInDays Optional expiration in days (null = never expires)
 * @returns Object with token (plaintext, shown only once) and tokenId
 */
export async function createApiToken(
  name: string,
  projectId?: string | null,
  expiresInDays?: number | null
): Promise<{ token: string; tokenId: string }> {
  const _headers = await headers()
  const session = await auth.api.getSession({ headers: _headers })

  if (!session?.session?.userId || !session?.session?.activeOrganizationId) {
    throw new BusinessError('UNAUTHORIZED', 'Please sign in.')
  }

  const orgId = session.session.activeOrganizationId
  const userId = session.session.userId

  try {
    // Generate the token
    const token = generateToken()
    const tokenHash = hashToken(token)
    const tokenPrefix = generateTokenPrefix(token)

    // Calculate expiration date if provided
    let expiresAt: Date | null = null
    if (expiresInDays && expiresInDays > 0) {
      expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + expiresInDays)
    }

    // If projectId provided, verify it belongs to this org
    if (projectId) {
      const project = await db.query.projects.findFirst({
        where: (projects, { eq }) => eq(projects.id, projectId)
      })

      if (!project || project.organizationId !== orgId) {
        throw new BusinessError(
          'NOT_FOUND',
          'Project not found or does not belong to this organization'
        )
      }
    }

    // Create the token
    const newToken: NewApiToken = {
      name,
      tokenHash,
      tokenPrefix,
      organizationId: orgId,
      projectId: projectId || null,
      createdBy: userId,
      expiresAt: expiresAt,
      lastUsed: null
    }

    const [created] = await db.insert(apiTokens).values(newToken).returning()

    if (!created) {
      throw new BusinessError('UNKNOWN', 'Failed to create API token')
    }

    // Revalidate cache
    revalidateTag(API_TOKENS_TAG)

    // Return the plaintext token (ONLY TIME it's visible)
    return {
      token,
      tokenId: created.id
    }
  } catch (error: any) {
    const { code, message } = mapError(error)
    throw new BusinessError(code, message ?? 'Failed to create API token')
  }
}

/**
 * Revokes (deletes) an API token
 * @param tokenId The token ID to revoke
 */
export async function revokeApiToken(tokenId: string): Promise<void> {
  const _headers = await headers()
  const session = await auth.api.getSession({ headers: _headers })

  if (!session?.session?.userId || !session?.session?.activeOrganizationId) {
    throw new BusinessError('UNAUTHORIZED', 'Please sign in.')
  }

  const orgId = session.session.activeOrganizationId

  try {
    // Verify token belongs to this org
    const token = await db.query.apiTokens.findFirst({
      where: eq(apiTokens.id, tokenId)
    })

    if (!token) {
      throw new BusinessError('NOT_FOUND', 'API token not found')
    }

    if (token.organizationId !== orgId) {
      throw new BusinessError(
        'UNAUTHORIZED',
        'You do not have access to this token'
      )
    }

    // Delete the token
    await db.delete(apiTokens).where(eq(apiTokens.id, tokenId))

    // Revalidate cache
    revalidateTag(API_TOKENS_TAG)
  } catch (error: any) {
    const { code, message } = mapError(error)
    throw new BusinessError(code, message ?? 'Failed to revoke API token')
  }
}

/**
 * Updates the lastUsed timestamp for a token
 * Called by API routes when token is used
 * @param tokenHash The hashed token
 */
export async function updateTokenLastUsed(tokenHash: string): Promise<void> {
  try {
    await db
      .update(apiTokens)
      .set({ lastUsed: new Date() })
      .where(eq(apiTokens.tokenHash, tokenHash))
  } catch (error) {
    // Silent fail - don't break API call if lastUsed update fails
    console.error('Failed to update token lastUsed:', error)
  }
}
