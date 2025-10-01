// src/app/api/cli/projects/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'

import { projects } from '@/db/schemas/app-schema'
import { extractBearerToken, validateApiToken } from '@/lib/auth/api-token-auth'
import { db } from '@/lib/sqlite-db'

export async function GET(request: NextRequest) {
  try {
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

    // Get projects for this organization
    let projectsList

    if (context.projectId) {
      // Token is scoped to specific project
      projectsList = await db
        .select()
        .from(projects)
        .where(eq(projects.id, context.projectId))
    } else {
      // Token has access to all projects in org
      projectsList = await db
        .select()
        .from(projects)
        .where(eq(projects.organizationId, context.organizationId))
    }

    // Return simplified project data
    const response = projectsList.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      slug: p.slug,
      createdAt: p.createdAt
    }))

    return NextResponse.json({ projects: response })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
