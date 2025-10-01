// src/app/(private)/projects/[projectId]/page.tsx
import Link from 'next/link'
import { ArrowLeft, Settings } from 'lucide-react'

import {
  getProjectById,
  getProjectEnvironments
} from '@/app/(private)/projects/data/projects.queries'
import { EnvironmentsDataTable } from '@/app/(private)/projects/components/EnvironmentsDataTable'
import { Button } from '@/components/ui/button'

export default async function ProjectDetailPage({
  params
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params

  const [project, environments] = await Promise.all([
    getProjectById(projectId),
    getProjectEnvironments(projectId)
  ])

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
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <Link href="/projects">
            <Button variant="ghost" size="sm" className="mb-2 -ml-2">
              <ArrowLeft className="size-4" />
              Back to Projects
            </Button>
          </Link>
          <h1 className="text-2xl font-bricolage-grotesque font-bold">
            {project.data.name}
          </h1>
          {project.data.description && (
            <p className="text-sm text-muted-foreground font-bricolage-grotesque">
              {project.data.description}
            </p>
          )}
          <div className="flex gap-2 mt-2">
            <div className="text-xs text-muted-foreground font-bricolage-grotesque">
              {project.data.environmentsCount} environments
            </div>
            <span className="text-xs text-muted-foreground">•</span>
            <div className="text-xs text-muted-foreground font-bricolage-grotesque">
              {project.data.secretsCount} secrets
            </div>
          </div>
        </div>
        <Link href={`/projects/${projectId}/settings`}>
          <Button variant="outline" size="sm">
            <Settings className="size-4" />
            Settings
          </Button>
        </Link>
      </div>

      <div>
        <h2 className="text-lg font-bricolage-grotesque font-semibold mb-4">
          Environments
        </h2>
        {environments.ok && environments.data ? (
          <EnvironmentsDataTable
            data={environments.data}
            projectId={projectId}
          />
        ) : (
          <div className="text-sm text-destructive font-bricolage-grotesque">
            {environments.message ?? 'Failed to load environments'}
          </div>
        )}
      </div>
    </div>
  )
}
