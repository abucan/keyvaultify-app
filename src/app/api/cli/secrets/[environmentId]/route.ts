// src/app/api/cli/secrets/[environmentId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'

import { environments, projects, secrets } from '@/db/schemas/app-schema'
import { extractBearerToken, validateApiToken } from '@/lib/auth/api-token-auth'
import { decryptSecret, encryptSecret } from '@/lib/crypto/encryption'
import { db } from '@/lib/sqlite-db'

/**
 * GET /api/cli/secrets/[environmentId]
 * Returns all secrets for an environment (decrypted)
 * Requires: Read permission (any role)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ environmentId: string }> }
) {
  try {
    const { environmentId } = await params

    // Extract and validate token
    const token = extractBearerToken(request)
    if (!token) {
      return NextResponse.json(
        { error: 'Missing Authorization header' },
        { status: 401 }
      )
    }

    const context = await validateApiToken(token)
    if (!context) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Verify environment belongs to a project in token's org
    const envWithProject = await db
      .select({
        environment: environments,
        project: projects
      })
      .from(environments)
      .innerJoin(projects, eq(environments.projectId, projects.id))
      .where(eq(environments.id, environmentId))
      .limit(1)

    if (!envWithProject[0]) {
      return NextResponse.json(
        { error: 'Environment not found' },
        { status: 404 }
      )
    }

    const { environment, project } = envWithProject[0]

    if (project.organizationId !== context.organizationId) {
      return NextResponse.json(
        { error: 'Environment not found' },
        { status: 404 }
      )
    }

    // If token is project-scoped, verify it matches
    if (context.projectId && context.projectId !== project.id) {
      return NextResponse.json(
        { error: 'Token does not have access to this project' },
        { status: 403 }
      )
    }

    // Get all secrets for this environment
    const secretsList = await db
      .select()
      .from(secrets)
      .where(eq(secrets.environmentId, environmentId))

    // Decrypt secrets
    const decryptedSecrets = secretsList.map(secret => {
      let decryptedValue = secret.value
      try {
        decryptedValue = decryptSecret(secret.value, context.organizationId)
      } catch (error) {
        console.error('Failed to decrypt secret:', error)
      }

      return {
        key: secret.key,
        value: decryptedValue
      }
    })

    return NextResponse.json({ secrets: decryptedSecrets })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/cli/secrets/[environmentId]
 * Creates or updates secrets in bulk
 * Requires: Write permission (admin/owner only)
 * Body: { secrets: [{ key: string, value: string }] }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ environmentId: string }> }
) {
  try {
    const { environmentId } = await params

    // Extract and validate token
    const token = extractBearerToken(request)
    if (!token) {
      return NextResponse.json(
        { error: 'Missing Authorization header' },
        { status: 401 }
      )
    }

    const context = await validateApiToken(token)
    if (!context) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Check write permission
    if (!context.canWrite) {
      return NextResponse.json(
        {
          error:
            'Insufficient permissions. Only admins and owners can write secrets.'
        },
        { status: 403 }
      )
    }

    // Verify environment belongs to a project in token's org
    const envWithProject = await db
      .select({
        environment: environments,
        project: projects
      })
      .from(environments)
      .innerJoin(projects, eq(environments.projectId, projects.id))
      .where(eq(environments.id, environmentId))
      .limit(1)

    if (!envWithProject[0]) {
      return NextResponse.json(
        { error: 'Environment not found' },
        { status: 404 }
      )
    }

    const { environment, project } = envWithProject[0]

    if (project.organizationId !== context.organizationId) {
      return NextResponse.json(
        { error: 'Environment not found' },
        { status: 404 }
      )
    }

    // If token is project-scoped, verify it matches
    if (context.projectId && context.projectId !== project.id) {
      return NextResponse.json(
        { error: 'Token does not have access to this project' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { secrets: secretsToUpsert } = body

    if (!Array.isArray(secretsToUpsert)) {
      return NextResponse.json(
        {
          error: 'Invalid request body. Expected { secrets: [{ key, value }] }'
        },
        { status: 400 }
      )
    }

    const results = {
      created: 0,
      updated: 0,
      failed: 0,
      errors: [] as string[]
    }

    // Upsert each secret
    for (const { key, value } of secretsToUpsert) {
      if (!key || !value) {
        results.failed++
        results.errors.push(`Invalid key or value`)
        continue
      }

      try {
        // Check if secret exists
        const existingSecret = await db.query.secrets.findFirst({
          where: (secrets, { and, eq }) =>
            and(eq(secrets.environmentId, environmentId), eq(secrets.key, key))
        })

        // Encrypt the value
        const encryptedValue = encryptSecret(value, context.organizationId)

        if (existingSecret) {
          // Update existing secret
          await db
            .update(secrets)
            .set({ value: encryptedValue, updatedAt: new Date() })
            .where(eq(secrets.id, existingSecret.id))
          results.updated++
        } else {
          // Create new secret
          await db.insert(secrets).values({
            key,
            value: encryptedValue,
            environmentId
          })
          results.created++
        }
      } catch (error) {
        results.failed++
        results.errors.push(`${key}: ${error}`)
      }
    }

    return NextResponse.json({
      success: true,
      results
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
