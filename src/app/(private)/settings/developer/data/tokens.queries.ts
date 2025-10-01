// src/app/(private)/settings/developer/data/tokens.queries.ts
import 'server-only'

import { desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { unstable_cache } from 'next/cache'

import { apiTokens, projects, type ApiToken } from '@/db/schemas/app-schema'
import { auth } from '@/lib/better-auth/auth'
import { mapError } from '@/lib/errors/mapError'
import { db } from '@/lib/sqlite-db'
import { R } from '@/types/result'

import { API_TOKENS_TAG } from './tokens.tags'

export type ApiTokenRow = {
  id: string
  name: string
  tokenPrefix: string
  projectName: string | null // null = "All Projects"
  projectId: string | null
  lastUsed: Date | null
  expiresAt: Date | null
  isExpired: boolean
  createdAt: Date | null
  _acl: {
    canRevoke: boolean
  }
}

const _getApiTokensCached = unstable_cache(
  async (_headers: Headers, _orgId: string, _userId: string) => {
    // Get all tokens for this organization
    const tokensList = await db
      .select({
        token: apiTokens,
        project: projects
      })
      .from(apiTokens)
      .leftJoin(projects, eq(apiTokens.projectId, projects.id))
      .where(eq(apiTokens.organizationId, _orgId))
      .orderBy(desc(apiTokens.createdAt))

    const now = new Date()

    const tokensWithMeta: ApiTokenRow[] = tokensList.map(
      ({ token, project }) => {
        const isExpired = token.expiresAt
          ? new Date(token.expiresAt) < now
          : false

        return {
          id: token.id,
          name: token.name,
          tokenPrefix: token.tokenPrefix,
          projectName: project?.name ?? null,
          projectId: token.projectId,
          lastUsed: token.lastUsed,
          expiresAt: token.expiresAt,
          isExpired,
          createdAt: token.createdAt,
          _acl: {
            canRevoke: true // All users can revoke tokens (will check permissions in mutation)
          }
        }
      }
    )

    return tokensWithMeta
  },
  ['api-tokens-by-org'],
  { tags: [API_TOKENS_TAG] }
)

export async function getApiTokens(): Promise<R<ApiTokenRow[]>> {
  try {
    const _headers = await headers()
    const session = await auth.api.getSession({ headers: _headers })
    const orgId = session?.session?.activeOrganizationId

    if (!orgId || !session?.session?.userId) {
      return {
        ok: false,
        code: 'UNAUTHORIZED',
        message: 'No active organization'
      }
    }

    const data = await _getApiTokensCached(
      _headers,
      orgId,
      session.session.userId
    )

    return { ok: true, data }
  } catch (error) {
    const { code, message } = mapError(error)
    return { ok: false, code, message }
  }
}
