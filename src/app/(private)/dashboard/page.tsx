// src/app/(private)/dashboard/page.tsx
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Key, Plus, FolderKey, Lock } from 'lucide-react'

import { getProjects } from '@/app/(private)/projects/data/projects.queries'
import { getEntitlements } from '@/app/(private)/settings/utils/entitlements'
import ToastOnce from '@/components/toast-token'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  const c = await cookies()
  const toast = c.get('kvf_toast')

  const projectsResult = await getProjects()
  const projects = projectsResult.ok ? projectsResult.data : []

  // Get subscription limits
  const entitlementsResult = await getEntitlements()
  const limits = entitlementsResult.ok
    ? entitlementsResult.data.limits
    : { projects: 3, secrets: 20, environments: 'unlimited' as const }

  // Calculate stats
  const totalProjects = projects.length
  const totalEnvironments = projects.reduce(
    (acc, p) => acc + p.environmentsCount,
    0
  )
  const totalSecrets = projects.reduce((acc, p) => acc + p.secretsCount, 0)

  // Format limits for display
  const projectsLimit =
    limits.projects === 'unlimited' ? 'Unlimited' : limits.projects
  const secretsLimit =
    limits.secrets === 'unlimited' ? 'Unlimited' : limits.secrets

  // Get recent projects (last 3)
  const recentProjects = projects.slice(0, 3)

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bricolage-grotesque font-bold">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground font-bricolage-grotesque mt-1">
              Overview of your projects and secrets
            </p>
          </div>
          <Link href="/projects">
            <Button>
              <Plus className="size-4" />
              <span className="font-bricolage-grotesque">New Project</span>
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-bricolage-grotesque">
                Total Projects
              </CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-bricolage-grotesque">
                {totalProjects} / {projectsLimit}
              </div>
              <p className="text-xs text-muted-foreground font-bricolage-grotesque">
                {limits.projects === 'unlimited'
                  ? 'No limit on your plan'
                  : `${limits.projects - totalProjects} remaining`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-bricolage-grotesque">
                Total Environments
              </CardTitle>
              <FolderKey className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-bricolage-grotesque">
                {totalEnvironments}
              </div>
              <p className="text-xs text-muted-foreground font-bricolage-grotesque">
                Development, staging, production
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-bricolage-grotesque">
                Total Secrets
              </CardTitle>
              <Lock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-bricolage-grotesque">
                {totalSecrets} / {secretsLimit}
              </div>
              <p className="text-xs text-muted-foreground font-bricolage-grotesque">
                {limits.secrets === 'unlimited'
                  ? 'No limit on your plan'
                  : `${limits.secrets - totalSecrets} remaining`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Projects */}
        {recentProjects.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-bricolage-grotesque">
                  Recent Projects
                </CardTitle>
                <Link href="/projects">
                  <Button variant="ghost" size="sm">
                    View all
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProjects.map(project => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Key className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium font-bricolage-grotesque">
                          {project.name}
                        </p>
                        {project.description && (
                          <p className="text-xs text-muted-foreground font-bricolage-grotesque line-clamp-1">
                            {project.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground font-bricolage-grotesque">
                      <span>{project.environmentsCount} envs</span>
                      <span>{project.secretsCount} secrets</span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {totalProjects === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <Key className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold font-bricolage-grotesque mb-2">
                No projects yet
              </h3>
              <p className="text-sm text-muted-foreground font-bricolage-grotesque mb-4 text-center max-w-md">
                Get started by creating your first project to manage environment
                variables across different environments.
              </p>
              <Link href="/projects">
                <Button>
                  <Plus className="size-4" />
                  <span className="font-bricolage-grotesque">
                    Create your first project
                  </span>
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
      <ToastOnce token={toast?.value} />
    </>
  )
}
