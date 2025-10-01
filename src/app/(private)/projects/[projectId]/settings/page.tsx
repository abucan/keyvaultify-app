// src/app/(private)/projects/[projectId]/settings/page.tsx
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { deleteProjectAction } from '@/app/(private)/projects/actions/deleteProjectAction'
import { getProjectById } from '@/app/(private)/projects/data/projects.queries'
import { ProjectSettingsForm } from '@/app/(private)/projects/components/ProjectSettingsForm'
import { DangerZoneCard } from '@/components/shared/DangerZoneCard'
import { Button } from '@/components/ui/button'
import { auth } from '@/lib/better-auth/auth'
import { headers } from 'next/headers'

export default async function ProjectSettingsPage({
  params
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const project = await getProjectById(projectId)

  const _headers = await headers()
  const hasPermission = await auth.api.hasPermission({
    headers: _headers,
    body: { permissions: { organization: ['update'] } }
  })

  if (!project.ok || !project.data) {
    return (
      <div className="flex flex-col gap-4">
        <div className="text-sm text-destructive font-bricolage-grotesque">
          {project.message ?? 'Project not found'}
        </div>
        <Link href="/projects">
          <Button variant="outline" size="sm">
            <ArrowLeft className="size-4" />
            Back to Projects
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link href={`/projects/${projectId}`}>
          <Button variant="ghost" size="sm" className="mb-2 -ml-2">
            <ArrowLeft className="size-4" />
            Back to {project.data.name}
          </Button>
        </Link>
        <h1 className="text-2xl font-bricolage-grotesque font-bold">
          Project Settings
        </h1>
        <p className="text-sm text-muted-foreground font-bricolage-grotesque">
          Manage your project configuration and settings.
        </p>
      </div>

      <div className="w-full flex flex-col gap-4 mb-6">
        <ProjectSettingsForm
          projectId={project.data.id}
          name={project.data.name}
          description={project.data.description}
          slug={project.data.slug}
          hasPermission={hasPermission.success}
        />

        <DangerZoneCard
          title="Delete project"
          description="Permanently delete this project and all its data."
          content={
            <>
              Deleting this project will permanently remove all environments and
              secrets associated with it. This action cannot be undone.
            </>
          }
          formAction={async () => {
            'use server'
            const result = await deleteProjectAction(projectId)
            return result
          }}
          hasPermission={hasPermission.success}
          errorMessages={{
            UNAUTHORIZED: 'You do not have permission to delete this project.',
            NOT_FOUND: 'Project not found.'
          }}
        />
      </div>
    </div>
  )
}
