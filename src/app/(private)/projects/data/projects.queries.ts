/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/(private)/projects/data/projects.queries.ts
import 'server-only'

import { unstable_cache } from 'next/cache'
import { headers } from 'next/headers'
import { count, desc, eq } from 'drizzle-orm'

import {
  type Environment,
  environments,
  type Project,
  projects,
  type Secret,
  secrets
} from '@/db/schemas/app-schema'
import { auth } from '@/lib/better-auth/auth'
import { decryptSecret } from '@/lib/crypto/encryption'
import { mapError } from '@/lib/errors/mapError'
import { db } from '@/lib/sqlite-db'
import { R } from '@/types/result'

import {
  ENVIRONMENTS_TAG,
  PROJECT_DETAIL_TAG,
  PROJECTS_TAG,
  SECRETS_TAG
} from './projects.tags'

export type ProjectRow = Project & {
  environmentsCount: number
  secretsCount: number
  _acl: {
    canEdit: boolean
    canDelete: boolean
  }
}

export type EnvironmentRow = Environment & {
  secretsCount: number
  isDefault: boolean
  _acl: {
    canEdit: boolean
    canDelete: boolean
  }
}

export type SecretRow = Secret & {
  _acl: {
    canEdit: boolean
    canDelete: boolean
    canView: boolean
  }
}

const _getProjectsCached = unstable_cache(
  async (_headers: Headers, _orgId: string, _userId?: string) => {
    // Get all projects for this organization
    const projectsList = await db
      .select()
      .from(projects)
      .where(eq(projects.organizationId, _orgId))
      .orderBy(desc(projects.createdAt))

    // Get counts for each project
    const projectsWithCounts: ProjectRow[] = await Promise.all(
      projectsList.map(async project => {
        // Count environments
        const envCount = await db
          .select({ count: count() })
          .from(environments)
          .where(eq(environments.projectId, project.id))

        // Count secrets (across all environments in this project)
        const secretCount = await db
          .select({ count: count() })
          .from(secrets)
          .innerJoin(environments, eq(secrets.environmentId, environments.id))
          .where(eq(environments.projectId, project.id))

        return {
          ...project,
          environmentsCount: envCount[0]?.count ?? 0,
          secretsCount: secretCount[0]?.count ?? 0,
          _acl: {
            canEdit: true, // will be refined based on role in actual implementation
            canDelete: true
          }
        }
      })
    )

    return projectsWithCounts
  },
  ['projects-by-org'],
  { tags: [PROJECTS_TAG] }
)

const _getProjectByIdCached = unstable_cache(
  async (
    _headers: Headers,
    _projectId: string,
    _orgId: string,
    _userId?: string
  ) => {
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, _projectId)
    })

    if (!project || project.organizationId !== _orgId) {
      return null
    }

    // Get counts
    const envCount = await db
      .select({ count: count() })
      .from(environments)
      .where(eq(environments.projectId, project.id))

    const secretCount = await db
      .select({ count: count() })
      .from(secrets)
      .innerJoin(environments, eq(secrets.environmentId, environments.id))
      .where(eq(environments.projectId, project.id))

    const projectRow: ProjectRow = {
      ...project,
      environmentsCount: envCount[0]?.count ?? 0,
      secretsCount: secretCount[0]?.count ?? 0,
      _acl: {
        canEdit: true,
        canDelete: true
      }
    }

    return projectRow
  },
  ['project-by-id'],
  { tags: [PROJECT_DETAIL_TAG] }
)

const _getProjectEnvironmentsCached = unstable_cache(
  async (
    _headers: Headers,
    _projectId: string,
    _orgId: string,
    _userId?: string
  ) => {
    // First verify project belongs to org
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, _projectId)
    })

    if (!project || project.organizationId !== _orgId) {
      return []
    }

    // Get environments for this project
    const envList = await db
      .select()
      .from(environments)
      .where(eq(environments.projectId, _projectId))
      .orderBy(desc(environments.createdAt))

    // Define default environments that cannot be edited/deleted
    const DEFAULT_ENVIRONMENTS = ['Development', 'Staging', 'Production']

    // Get secret counts for each environment
    const envsWithCounts: EnvironmentRow[] = await Promise.all(
      envList.map(async env => {
        const secretCount = await db
          .select({ count: count() })
          .from(secrets)
          .where(eq(secrets.environmentId, env.id))

        const isDefault = DEFAULT_ENVIRONMENTS.includes(env.name)

        return {
          ...env,
          secretsCount: secretCount[0]?.count ?? 0,
          isDefault,
          _acl: {
            canEdit: !isDefault, // Can only edit custom environments
            canDelete: !isDefault // Can only delete custom environments
          }
        }
      })
    )

    return envsWithCounts
  },
  ['environments-by-project'],
  { tags: [ENVIRONMENTS_TAG] }
)

const _getEnvironmentSecretsCached = unstable_cache(
  async (
    _headers: Headers,
    _environmentId: string,
    _orgId: string,
    _userId?: string
  ) => {
    // First verify environment belongs to a project in this org
    const envWithProject = await db
      .select({
        environment: environments,
        project: projects
      })
      .from(environments)
      .innerJoin(projects, eq(environments.projectId, projects.id))
      .where(eq(environments.id, _environmentId))
      .limit(1)

    if (
      !envWithProject[0] ||
      envWithProject[0].project.organizationId !== _orgId
    ) {
      return []
    }

    // Get secrets for this environment
    const secretsList = await db
      .select()
      .from(secrets)
      .where(eq(secrets.environmentId, _environmentId))
      .orderBy(desc(secrets.createdAt))

    // Decrypt secrets and add ACL
    const secretsWithDecrypted: SecretRow[] = secretsList.map(secret => {
      let decryptedValue = secret.value
      try {
        decryptedValue = decryptSecret(secret.value, _orgId)
      } catch (error) {
        console.error('Failed to decrypt secret:', error)
        // Keep encrypted value if decryption fails
      }

      return {
        ...secret,
        value: decryptedValue,
        _acl: {
          canEdit: true,
          canDelete: true,
          canView: true
        }
      }
    })

    return secretsWithDecrypted
  },
  ['secrets-by-environment'],
  { tags: [SECRETS_TAG] }
)

export async function getProjects(): Promise<R<ProjectRow[]>> {
  try {
    const _headers = await headers()
    const _session = await auth.api.getSession({ headers: _headers })
    const orgId = _session?.session?.activeOrganizationId

    if (!orgId) {
      return {
        ok: false,
        code: 'UNAUTHORIZED',
        message: 'No active organization'
      }
    }

    const data = await _getProjectsCached(
      _headers,
      orgId,
      _session?.session?.userId
    )

    return { ok: true, data }
  } catch (error) {
    const { code, message } = mapError(error)
    return { ok: false, code, message }
  }
}

export async function getProjectById(
  projectId: string
): Promise<R<ProjectRow>> {
  try {
    const _headers = await headers()
    const _session = await auth.api.getSession({ headers: _headers })
    const orgId = _session?.session?.activeOrganizationId

    if (!orgId) {
      return {
        ok: false,
        code: 'UNAUTHORIZED',
        message: 'No active organization'
      }
    }

    const data = await _getProjectByIdCached(
      _headers,
      projectId,
      orgId,
      _session?.session?.userId
    )

    if (!data) {
      return {
        ok: false,
        code: 'NOT_FOUND',
        message: 'Project not found'
      }
    }

    return { ok: true, data }
  } catch (error) {
    const { code, message } = mapError(error)
    return { ok: false, code, message }
  }
}

export async function getProjectEnvironments(
  projectId: string
): Promise<R<EnvironmentRow[]>> {
  try {
    const _headers = await headers()
    const _session = await auth.api.getSession({ headers: _headers })
    const orgId = _session?.session?.activeOrganizationId

    if (!orgId) {
      return {
        ok: false,
        code: 'UNAUTHORIZED',
        message: 'No active organization'
      }
    }

    const data = await _getProjectEnvironmentsCached(
      _headers,
      projectId,
      orgId,
      _session?.session?.userId
    )

    return { ok: true, data }
  } catch (error) {
    const { code, message } = mapError(error)
    return { ok: false, code, message }
  }
}

export async function getEnvironmentSecrets(
  environmentId: string
): Promise<R<SecretRow[]>> {
  try {
    const _headers = await headers()
    const _session = await auth.api.getSession({ headers: _headers })
    const orgId = _session?.session?.activeOrganizationId

    if (!orgId) {
      return {
        ok: false,
        code: 'UNAUTHORIZED',
        message: 'No active organization'
      }
    }

    const data = await _getEnvironmentSecretsCached(
      _headers,
      environmentId,
      orgId,
      _session?.session?.userId
    )

    return { ok: true, data }
  } catch (error) {
    const { code, message } = mapError(error)
    return { ok: false, code, message }
  }
}
