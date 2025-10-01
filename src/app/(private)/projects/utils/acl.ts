// src/app/(private)/projects/utils/acl.ts
import 'server-only'

import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'

import { projects } from '@/db/schemas/app-schema'
import { auth } from '@/lib/better-auth/auth'
import { BusinessError } from '@/lib/errors/business-error'
import { db } from '@/lib/sqlite-db'

/**
 * Gets the current user's role in the active organization
 */
export async function getMyRole(): Promise<'owner' | 'admin' | 'member'> {
  const _headers = await headers()
  const org = await auth.api.getActiveMember({ headers: _headers })
  if (!org || !org.role) {
    throw new BusinessError('UNAUTHORIZED', 'No active member role')
  }
  return org.role as 'owner' | 'admin' | 'member'
}

/**
 * Verifies that a project belongs to the active organization
 * @param projectId The project ID to verify
 * @throws BusinessError if project doesn't exist or doesn't belong to org
 */
export async function requireProjectAccess(projectId: string): Promise<void> {
  const _headers = await headers()
  const session = await auth.api.getSession({ headers: _headers })

  if (!session?.session?.activeOrganizationId) {
    throw new BusinessError('UNAUTHORIZED', 'No active organization')
  }

  const orgId = session.session.activeOrganizationId

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId)
  })

  if (!project) {
    throw new BusinessError('NOT_FOUND', 'Project not found')
  }

  if (project.organizationId !== orgId) {
    throw new BusinessError(
      'UNAUTHORIZED',
      'You do not have access to this project'
    )
  }
}

/**
 * Verifies that the user has write permissions for a project (admin/owner only)
 * @param projectId The project ID
 * @throws BusinessError if user doesn't have write permissions
 */
export async function requireProjectWrite(projectId: string): Promise<void> {
  // First ensure project access
  await requireProjectAccess(projectId)

  // Check role permissions
  const role = await getMyRole()

  if (role !== 'owner' && role !== 'admin') {
    throw new BusinessError(
      'UNAUTHORIZED',
      'You do not have permission to modify this project. Only owners and admins can make changes.'
    )
  }

  // Alternative: use Better Auth's permission system
  const _headers = await headers()
  const hasPermission = await auth.api.hasPermission({
    headers: _headers,
    body: { permissions: { organization: ['update'] } }
  })

  if (!hasPermission.success) {
    throw new BusinessError(
      'UNAUTHORIZED',
      'You do not have permission to modify projects'
    )
  }
}
