// src/app/api/cli/projects/[projectId]/environments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'

import { environments, projects } from '@/db/schemas/app-schema'
import { extractBearerToken, validateApiToken } from '@/lib/auth/api-token-auth'
import { db } from '@/lib/sqlite-db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params

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

    // Verify project belongs to token's organization
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId)
    })

    if (!project || project.organizationId !== context.organizationId) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // If token is project-scoped, verify it matches
    if (context.projectId && context.projectId !== projectId) {
      return NextResponse.json(
        { error: 'Token does not have access to this project' },
        { status: 403 }
      )
    }

    // Get environments for this project
    const envList = await db
      .select()
      .from(environments)
      .where(eq(environments.projectId, projectId))

    const response = envList.map(env => ({
      id: env.id,
      name: env.name,
      description: env.description,
      createdAt: env.createdAt
    }))

    return NextResponse.json({ environments: response })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
