// src/app/api/cli/secrets/[environmentId]/[key]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'

import { environments, projects, secrets } from '@/db/schemas/app-schema'
import { extractBearerToken, validateApiToken } from '@/lib/auth/api-token-auth'
import { db } from '@/lib/sqlite-db'

/**
 * DELETE /api/cli/secrets/[environmentId]/[key]
 * Deletes a specific secret
 * Requires: Write permission (admin/owner only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ environmentId: string; key: string }> }
) {
  try {
    const { environmentId, key } = await params

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
            'Insufficient permissions. Only admins and owners can delete secrets.'
        },
        { status: 403 }
      )
    }

    // Verify environment belongs to token's org
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

    const { project } = envWithProject[0]

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

    // Delete the secret
    const result = await db
      .delete(secrets)
      .where(
        and(eq(secrets.environmentId, environmentId), eq(secrets.key, key))
      )
      .returning()

    if (result.length === 0) {
      return NextResponse.json({ error: 'Secret not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Secret deleted' })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
