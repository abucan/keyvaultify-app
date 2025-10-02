// src/app/api/cli/auth/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'

import { organization } from '@/db/schemas/auth-schema'
import { extractBearerToken, validateApiToken } from '@/lib/auth/api-token-auth'
import { db } from '@/lib/sqlite-db'

export async function GET(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const token = extractBearerToken(request)
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Missing Authorization header'
        },
        { status: 401 }
      )
    }

    // Validate token
    const context = await validateApiToken(token)
    if (!context) {
      console.error('Invalid or expired token here.')
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Invalid or expired token'
        },
        { status: 401 }
      )
    }

    // Get organization name
    const org = await db.query.organization.findFirst({
      where: eq(organization.id, context.organizationId)
    })

    // Return success with user context
    return NextResponse.json({
      success: true,
      data: {
        organizationId: context.organizationId,
        organizationName: org?.name || 'Unknown Organization',
        projectId: context.projectId,
        userId: context.userId,
        role: context.role,
        canRead: context.canRead,
        canWrite: context.canWrite
      }
    })
  } catch (error) {
    console.error('Auth API Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'SERVER_ERROR',
        message: 'Internal server error'
      },
      { status: 500 }
    )
  }
}
