// src/app/(private)/projects/[projectId]/environments/[envId]/page.tsx
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import {
  getEnvironmentSecrets,
  getProjectById,
  getProjectEnvironments
} from '@/app/(private)/projects/data/projects.queries'
import { SecretsDataTable } from '@/app/(private)/projects/components/SecretsDataTable'
import { Button } from '@/components/ui/button'

export default async function EnvironmentDetailPage({
  params
}: {
  params: Promise<{ projectId: string; envId: string }>
}) {
  const { projectId, envId } = await params

  const [project, secrets, environments] = await Promise.all([
    getProjectById(projectId),
    getEnvironmentSecrets(envId),
    getProjectEnvironments(projectId)
  ])

  if (!secrets.ok) {
    return (
      <div className="flex flex-col gap-4">
        <div className="text-sm text-destructive font-bricolage-grotesque">
          {secrets.message ?? 'Environment not found'}
        </div>
        <Link href={`/projects/${projectId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="size-4" />
            Back to Project
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
            Back to {project.ok ? project.data?.name : 'Project'}
          </Button>
        </Link>
        <h1 className="text-2xl font-bricolage-grotesque font-bold">
          Environment Secrets
        </h1>
        <p className="text-sm text-muted-foreground font-bricolage-grotesque">
          Manage environment variables for this environment. All values are
          encrypted at rest.
        </p>
      </div>

      <div>
        <SecretsDataTable
          data={secrets.data ?? []}
          environmentId={envId}
          projectId={projectId}
          environments={environments.ok ? environments.data : []}
        />
      </div>
    </div>
  )
}
