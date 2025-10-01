// src/app/(private)/settings/developer/page.tsx
import { headers } from 'next/headers'

import { getProjects } from '@/app/(private)/projects/data/projects.queries'
import { getApiTokens } from '@/app/(private)/settings/developer/data/tokens.queries'
import { ApiTokensColumns } from '@/app/(private)/settings/developer/components/ApiTokensColumns'
import { ApiTokensDataTable } from '@/app/(private)/settings/developer/components/ApiTokensDataTable'
import { auth } from '@/lib/better-auth/auth'

export default async function DeveloperPage() {
  const tokens = await getApiTokens()
  const projectsResult = await getProjects()
  const projects = projectsResult.ok
    ? projectsResult.data.map(p => ({ id: p.id, name: p.name }))
    : []

  // Get current user's role
  const _headers = await headers()
  const member = await auth.api.getActiveMember({ headers: _headers })
  const currentRole = (member?.role as 'owner' | 'admin' | 'member') || 'member'

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bricolage-grotesque font-bold">
          Developer Settings
        </h1>
        <p className="text-sm text-muted-foreground font-bricolage-grotesque mt-1">
          Manage API tokens for CLI and API access to your projects.
        </p>
      </div>

      <div className="rounded-lg border p-4 bg-muted/20">
        <h3 className="text-sm font-medium font-bricolage-grotesque mb-2">
          About API Tokens
        </h3>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside font-bricolage-grotesque">
          <li>
            Tokens allow CLI tools and scripts to access your projects
            programmatically
          </li>
          <li>
            Your role (<strong>{currentRole}</strong>) determines token
            permissions dynamically
          </li>
          <li>
            Members can read (pull) secrets, admins/owners can write (push)
          </li>
          <li>Tokens can be scoped to all projects or a specific project</li>
          <li>For security, set an expiration date and revoke unused tokens</li>
        </ul>
      </div>

      {tokens.ok && tokens.data && (
        <ApiTokensDataTable
          columns={ApiTokensColumns}
          data={tokens.data}
          projects={projects}
          currentRole={currentRole}
        />
      )}

      {!tokens.ok && (
        <div className="text-sm text-destructive font-bricolage-grotesque">
          {tokens.message ?? 'Failed to load API tokens'}
        </div>
      )}
    </div>
  )
}
