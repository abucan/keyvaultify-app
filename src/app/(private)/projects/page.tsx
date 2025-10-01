// src/app/(private)/projects/page.tsx
import { getProjects } from '@/app/(private)/projects/data/projects.queries'
import { ProjectsColumns } from '@/app/(private)/projects/components/ProjectsColumns'
import { ProjectsDataTable } from '@/app/(private)/projects/components/ProjectsDataTable'

export default async function ProjectsPage() {
  const result = await getProjects()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bricolage-grotesque font-bold">
          Projects
        </h1>
        <p className="text-sm text-muted-foreground font-bricolage-grotesque mt-1">
          Manage your projects and their environment variables.
        </p>
      </div>

      {result.ok && result.data && (
        <ProjectsDataTable columns={ProjectsColumns} data={result.data} />
      )}

      {!result.ok && (
        <div className="text-sm text-destructive font-bricolage-grotesque">
          {result.message ?? 'Failed to load projects'}
        </div>
      )}
    </div>
  )
}

