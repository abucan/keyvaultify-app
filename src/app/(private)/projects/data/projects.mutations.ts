// src/app/(private)/projects/data/projects.mutations.ts
import 'server-only'

import { revalidateTag } from 'next/cache'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'

import {
  checkProjectLimit,
  checkSecretLimit
} from '@/app/(private)/settings/utils/entitlements'
import {
  environments,
  type NewEnvironment,
  type NewProject,
  type NewSecret,
  projects,
  secrets
} from '@/db/schemas/app-schema'
import { auth } from '@/lib/better-auth/auth'
import { encryptSecret } from '@/lib/crypto/encryption'
import { BusinessError } from '@/lib/errors/business-error'
import { mapError } from '@/lib/errors/mapError'
import { db } from '@/lib/sqlite-db'

import {
  ENVIRONMENTS_TAG,
  PROJECT_DETAIL_TAG,
  PROJECTS_TAG,
  SECRETS_TAG
} from './projects.tags'

/**
 * Creates a new project with default environments
 * @param name Project name
 * @param description Optional project description
 * @param slug Optional URL-friendly slug
 * @returns The created project ID
 */
export async function createProject(
  name: string,
  description?: string,
  slug?: string
): Promise<string> {
  const _headers = await headers()
  const session = await auth.api.getSession({ headers: _headers })

  if (!session?.session?.userId || !session?.session?.activeOrganizationId) {
    throw new BusinessError('UNAUTHORIZED', 'Please sign in.')
  }

  const orgId = session.session.activeOrganizationId
  const userId = session.session.userId

  try {
    // Check if project limit is reached
    const canCreateProject = await checkProjectLimit()
    if (!canCreateProject) {
      throw new BusinessError(
        'LIMIT_REACHED',
        'Project limit reached for your plan. Please upgrade to create more projects.'
      )
    }

    // Create the project
    const newProject: NewProject = {
      name,
      description: description ?? null,
      slug: slug ?? null,
      organizationId: orgId,
      createdBy: userId
    }

    const [project] = await db.insert(projects).values(newProject).returning()

    if (!project) {
      throw new BusinessError('UNKNOWN', 'Failed to create project')
    }

    // Create default environments: Development, Staging, Production
    const defaultEnvironments: NewEnvironment[] = [
      {
        name: 'Development',
        description: 'Development environment',
        projectId: project.id
      },
      {
        name: 'Staging',
        description: 'Staging environment',
        projectId: project.id
      },
      {
        name: 'Production',
        description: 'Production environment',
        projectId: project.id
      }
    ]

    await db.insert(environments).values(defaultEnvironments)

    // Revalidate cache
    revalidateTag(PROJECTS_TAG)
    revalidateTag(PROJECT_DETAIL_TAG)
    revalidateTag(ENVIRONMENTS_TAG)

    return project.id
  } catch (error: any) {
    const { code, message } = mapError(error)
    throw new BusinessError(code, message ?? 'Failed to create project')
  }
}

/**
 * Updates an existing project
 * @param projectId The project ID to update
 * @param data Partial project data to update
 */
export async function updateProject(
  projectId: string,
  data: { name?: string; description?: string; slug?: string }
): Promise<void> {
  const _headers = await headers()
  const session = await auth.api.getSession({ headers: _headers })

  if (!session?.session?.userId || !session?.session?.activeOrganizationId) {
    throw new BusinessError('UNAUTHORIZED', 'Please sign in.')
  }

  const orgId = session.session.activeOrganizationId

  try {
    // Verify project belongs to org
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

    // Check permissions (admin/owner)
    const hasPermission = await auth.api.hasPermission({
      headers: _headers,
      body: { permissions: { organization: ['update'] } }
    })

    if (!hasPermission.success) {
      throw new BusinessError(
        'UNAUTHORIZED',
        'You do not have permission to update projects'
      )
    }

    // Update project
    const updateData: Partial<NewProject> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined)
      updateData.description = data.description
    if (data.slug !== undefined) updateData.slug = data.slug

    if (Object.keys(updateData).length === 0) {
      throw new BusinessError('NO_CHANGES', 'No changes to update')
    }

    await db.update(projects).set(updateData).where(eq(projects.id, projectId))

    // Revalidate cache
    revalidateTag(PROJECTS_TAG)
    revalidateTag(PROJECT_DETAIL_TAG)
  } catch (error: any) {
    const { code, message } = mapError(error)
    throw new BusinessError(code, message ?? 'Failed to update project')
  }
}

/**
 * Deletes a project (cascades to environments and secrets)
 * @param projectId The project ID to delete
 */
export async function deleteProject(projectId: string): Promise<void> {
  const _headers = await headers()
  const session = await auth.api.getSession({ headers: _headers })

  if (!session?.session?.userId || !session?.session?.activeOrganizationId) {
    throw new BusinessError('UNAUTHORIZED', 'Please sign in.')
  }

  const orgId = session.session.activeOrganizationId

  try {
    // Verify project belongs to org
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

    // Check permissions (admin/owner)
    const hasPermission = await auth.api.hasPermission({
      headers: _headers,
      body: { permissions: { organization: ['delete'] } }
    })

    if (!hasPermission.success) {
      throw new BusinessError(
        'UNAUTHORIZED',
        'You do not have permission to delete projects'
      )
    }

    // Delete project (cascade will handle environments and secrets)
    await db.delete(projects).where(eq(projects.id, projectId))

    // Revalidate cache
    revalidateTag(PROJECTS_TAG)
    revalidateTag(PROJECT_DETAIL_TAG)
    revalidateTag(ENVIRONMENTS_TAG)
    revalidateTag(SECRETS_TAG)
  } catch (error: any) {
    const { code, message } = mapError(error)
    throw new BusinessError(code, message ?? 'Failed to delete project')
  }
}

/**
 * Creates a new environment in a project
 * @param projectId The project ID
 * @param name Environment name
 * @param description Optional description
 * @returns The created environment ID
 */
export async function createEnvironment(
  projectId: string,
  name: string,
  description?: string
): Promise<string> {
  const _headers = await headers()
  const session = await auth.api.getSession({ headers: _headers })

  if (!session?.session?.userId || !session?.session?.activeOrganizationId) {
    throw new BusinessError('UNAUTHORIZED', 'Please sign in.')
  }

  const orgId = session.session.activeOrganizationId

  try {
    // Verify project belongs to org
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

    // Check permissions (admin/owner)
    const hasPermission = await auth.api.hasPermission({
      headers: _headers,
      body: { permissions: { organization: ['update'] } }
    })

    if (!hasPermission.success) {
      throw new BusinessError(
        'UNAUTHORIZED',
        'You do not have permission to create environments'
      )
    }

    // Create environment
    const newEnv: NewEnvironment = {
      name,
      description: description ?? null,
      projectId
    }

    const [environment] = await db
      .insert(environments)
      .values(newEnv)
      .returning()

    if (!environment) {
      throw new BusinessError('UNKNOWN', 'Failed to create environment')
    }

    // Revalidate cache
    revalidateTag(ENVIRONMENTS_TAG)
    revalidateTag(PROJECT_DETAIL_TAG)

    return environment.id
  } catch (error: any) {
    const { code, message } = mapError(error)
    throw new BusinessError(code, message ?? 'Failed to create environment')
  }
}

/**
 * Updates an existing environment
 * @param envId The environment ID
 * @param data Partial environment data to update
 */
export async function updateEnvironment(
  envId: string,
  data: { name?: string; description?: string }
): Promise<void> {
  const _headers = await headers()
  const session = await auth.api.getSession({ headers: _headers })

  if (!session?.session?.userId || !session?.session?.activeOrganizationId) {
    throw new BusinessError('UNAUTHORIZED', 'Please sign in.')
  }

  const orgId = session.session.activeOrganizationId

  try {
    // Verify environment belongs to org's project
    const envWithProject = await db
      .select({
        environment: environments,
        project: projects
      })
      .from(environments)
      .innerJoin(projects, eq(environments.projectId, projects.id))
      .where(eq(environments.id, envId))
      .limit(1)

    if (!envWithProject[0]) {
      throw new BusinessError('NOT_FOUND', 'Environment not found')
    }

    if (envWithProject[0].project.organizationId !== orgId) {
      throw new BusinessError(
        'UNAUTHORIZED',
        'You do not have access to this environment'
      )
    }

    // Check permissions (admin/owner)
    const hasPermission = await auth.api.hasPermission({
      headers: _headers,
      body: { permissions: { organization: ['update'] } }
    })

    if (!hasPermission.success) {
      throw new BusinessError(
        'UNAUTHORIZED',
        'You do not have permission to update environments'
      )
    }

    // Update environment
    const updateData: Partial<NewEnvironment> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined)
      updateData.description = data.description

    if (Object.keys(updateData).length === 0) {
      throw new BusinessError('NO_CHANGES', 'No changes to update')
    }

    await db
      .update(environments)
      .set(updateData)
      .where(eq(environments.id, envId))

    // Revalidate cache
    revalidateTag(ENVIRONMENTS_TAG)
    revalidateTag(PROJECT_DETAIL_TAG)
  } catch (error: any) {
    const { code, message } = mapError(error)
    throw new BusinessError(code, message ?? 'Failed to update environment')
  }
}

/**
 * Deletes an environment (cascades to secrets)
 * @param envId The environment ID
 */
export async function deleteEnvironment(envId: string): Promise<void> {
  const _headers = await headers()
  const session = await auth.api.getSession({ headers: _headers })

  if (!session?.session?.userId || !session?.session?.activeOrganizationId) {
    throw new BusinessError('UNAUTHORIZED', 'Please sign in.')
  }

  const orgId = session.session.activeOrganizationId

  try {
    // Verify environment belongs to org's project
    const envWithProject = await db
      .select({
        environment: environments,
        project: projects
      })
      .from(environments)
      .innerJoin(projects, eq(environments.projectId, projects.id))
      .where(eq(environments.id, envId))
      .limit(1)

    if (!envWithProject[0]) {
      throw new BusinessError('NOT_FOUND', 'Environment not found')
    }

    if (envWithProject[0].project.organizationId !== orgId) {
      throw new BusinessError(
        'UNAUTHORIZED',
        'You do not have access to this environment'
      )
    }

    // Check permissions (admin/owner)
    const hasPermission = await auth.api.hasPermission({
      headers: _headers,
      body: { permissions: { organization: ['delete'] } }
    })

    if (!hasPermission.success) {
      throw new BusinessError(
        'UNAUTHORIZED',
        'You do not have permission to delete environments'
      )
    }

    // Delete environment (cascade will handle secrets)
    await db.delete(environments).where(eq(environments.id, envId))

    // Revalidate cache
    revalidateTag(ENVIRONMENTS_TAG)
    revalidateTag(PROJECT_DETAIL_TAG)
    revalidateTag(SECRETS_TAG)
  } catch (error: any) {
    const { code, message } = mapError(error)
    throw new BusinessError(code, message ?? 'Failed to delete environment')
  }
}

/**
 * Creates a new secret (encrypts the value)
 * @param environmentId The environment ID
 * @param key Secret key name
 * @param value Secret value (will be encrypted)
 * @returns The created secret ID
 */
export async function createSecret(
  environmentId: string,
  key: string,
  value: string
): Promise<string> {
  const _headers = await headers()
  const session = await auth.api.getSession({ headers: _headers })

  if (!session?.session?.userId || !session?.session?.activeOrganizationId) {
    throw new BusinessError('UNAUTHORIZED', 'Please sign in.')
  }

  const orgId = session.session.activeOrganizationId

  try {
    // Check secret limit
    const canCreateSecret = await checkSecretLimit()
    if (!canCreateSecret) {
      throw new BusinessError(
        'LIMIT_REACHED',
        'Secret limit reached for your plan. Please upgrade to create more secrets.'
      )
    }

    // Verify environment belongs to org's project
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
      throw new BusinessError('NOT_FOUND', 'Environment not found')
    }

    if (envWithProject[0].project.organizationId !== orgId) {
      throw new BusinessError(
        'UNAUTHORIZED',
        'You do not have access to this environment'
      )
    }

    // Check permissions (admin/owner)
    const hasPermission = await auth.api.hasPermission({
      headers: _headers,
      body: { permissions: { organization: ['update'] } }
    })

    if (!hasPermission.success) {
      throw new BusinessError(
        'UNAUTHORIZED',
        'You do not have permission to create secrets'
      )
    }

    // Check if key already exists in this environment
    const existingSecret = await db.query.secrets.findFirst({
      where: (secrets, { and, eq }) =>
        and(eq(secrets.environmentId, environmentId), eq(secrets.key, key))
    })

    if (existingSecret) {
      throw new BusinessError(
        'DUPLICATE_KEY',
        `Secret with key "${key}" already exists in this environment. Please use a different key or edit the existing secret.`
      )
    }

    // Encrypt the secret value
    const encryptedValue = encryptSecret(value, orgId)

    // Create secret
    const newSecret: NewSecret = {
      key,
      value: encryptedValue,
      environmentId
    }

    const [secret] = await db.insert(secrets).values(newSecret).returning()

    if (!secret) {
      throw new BusinessError('UNKNOWN', 'Failed to create secret')
    }

    // Revalidate cache
    revalidateTag(SECRETS_TAG)
    revalidateTag(ENVIRONMENTS_TAG)
    revalidateTag(PROJECT_DETAIL_TAG)

    return secret.id
  } catch (error: any) {
    const { code, message } = mapError(error)
    throw new BusinessError(code, message ?? 'Failed to create secret')
  }
}

/**
 * Updates an existing secret
 * @param secretId The secret ID
 * @param key Optional new key name
 * @param value Optional new value (will be re-encrypted)
 */
export async function updateSecret(
  secretId: string,
  key?: string,
  value?: string
): Promise<void> {
  const _headers = await headers()
  const session = await auth.api.getSession({ headers: _headers })

  if (!session?.session?.userId || !session?.session?.activeOrganizationId) {
    throw new BusinessError('UNAUTHORIZED', 'Please sign in.')
  }

  const orgId = session.session.activeOrganizationId

  try {
    // Verify secret belongs to org's project
    const secretWithOrg = await db
      .select({
        secret: secrets,
        environment: environments,
        project: projects
      })
      .from(secrets)
      .innerJoin(environments, eq(secrets.environmentId, environments.id))
      .innerJoin(projects, eq(environments.projectId, projects.id))
      .where(eq(secrets.id, secretId))
      .limit(1)

    if (!secretWithOrg[0]) {
      throw new BusinessError('NOT_FOUND', 'Secret not found')
    }

    if (secretWithOrg[0].project.organizationId !== orgId) {
      throw new BusinessError(
        'UNAUTHORIZED',
        'You do not have access to this secret'
      )
    }

    // Check permissions (admin/owner)
    const hasPermission = await auth.api.hasPermission({
      headers: _headers,
      body: { permissions: { organization: ['update'] } }
    })

    if (!hasPermission.success) {
      throw new BusinessError(
        'UNAUTHORIZED',
        'You do not have permission to update secrets'
      )
    }

    // If updating the key, check for duplicates
    if (key !== undefined && key !== secretWithOrg[0].secret.key) {
      const existingSecret = await db.query.secrets.findFirst({
        where: (secrets, { and, eq }) =>
          and(
            eq(secrets.environmentId, secretWithOrg[0].environment.id),
            eq(secrets.key, key)
          )
      })

      if (existingSecret) {
        throw new BusinessError(
          'DUPLICATE_KEY',
          `Secret with key "${key}" already exists in this environment. Please use a different key.`
        )
      }
    }

    // Update secret
    const updateData: Partial<NewSecret> = {}
    if (key !== undefined) updateData.key = key
    if (value !== undefined) {
      // Re-encrypt the new value
      updateData.value = encryptSecret(value, orgId)
    }

    if (Object.keys(updateData).length === 0) {
      throw new BusinessError('NO_CHANGES', 'No changes to update')
    }

    await db.update(secrets).set(updateData).where(eq(secrets.id, secretId))

    // Revalidate cache
    revalidateTag(SECRETS_TAG)
    revalidateTag(ENVIRONMENTS_TAG)
    revalidateTag(PROJECT_DETAIL_TAG)
  } catch (error: any) {
    const { code, message } = mapError(error)
    throw new BusinessError(code, message ?? 'Failed to update secret')
  }
}

/**
 * Deletes a secret
 * @param secretId The secret ID
 */
export async function deleteSecret(secretId: string): Promise<void> {
  const _headers = await headers()
  const session = await auth.api.getSession({ headers: _headers })

  if (!session?.session?.userId || !session?.session?.activeOrganizationId) {
    throw new BusinessError('UNAUTHORIZED', 'Please sign in.')
  }

  const orgId = session.session.activeOrganizationId

  try {
    // Verify secret belongs to org's project
    const secretWithOrg = await db
      .select({
        secret: secrets,
        environment: environments,
        project: projects
      })
      .from(secrets)
      .innerJoin(environments, eq(secrets.environmentId, environments.id))
      .innerJoin(projects, eq(environments.projectId, projects.id))
      .where(eq(secrets.id, secretId))
      .limit(1)

    if (!secretWithOrg[0]) {
      throw new BusinessError('NOT_FOUND', 'Secret not found')
    }

    if (secretWithOrg[0].project.organizationId !== orgId) {
      throw new BusinessError(
        'UNAUTHORIZED',
        'You do not have access to this secret'
      )
    }

    // Check permissions (admin/owner)
    const hasPermission = await auth.api.hasPermission({
      headers: _headers,
      body: { permissions: { organization: ['delete'] } }
    })

    if (!hasPermission.success) {
      throw new BusinessError(
        'UNAUTHORIZED',
        'You do not have permission to delete secrets'
      )
    }

    // Delete secret
    await db.delete(secrets).where(eq(secrets.id, secretId))

    // Revalidate cache
    revalidateTag(SECRETS_TAG)
    revalidateTag(ENVIRONMENTS_TAG)
    revalidateTag(PROJECT_DETAIL_TAG)
  } catch (error: any) {
    const { code, message } = mapError(error)
    throw new BusinessError(code, message ?? 'Failed to delete secret')
  }
}
