/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(private)/layout.tsx
import 'server-only'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { ModeToggle } from '@/components/shared/ModeToggle'
import { SearchCommand } from '@/components/shared/SearchCommand'
import { AppSidebar } from '@/components/sidebar/app-sidebar'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar'
import { auth } from '@/lib/better-auth/auth'
import { listTeams } from '@/server/team.actions'
import { SidebarCtx } from '@/types'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const hdrs = await headers()
  const session = await auth.api.getSession({ headers: hdrs })
  if (!session?.user) redirect('/signin')

  let full = await auth.api
    .getFullOrganization({ headers: hdrs })
    .catch(() => null)
  if (!full?.id) {
    const orgs = await auth.api.listOrganizations({ headers: hdrs })
    let orgId = orgs?.[0]?.id
    if (!orgId) {
      const base = (session.user.email?.split('@')[0] ?? 'workspace')
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '')
      const newOrg = await auth.api.createOrganization({
        headers: hdrs,
        body: {
          name: `${session.user.name ?? base}'s Workspace`,
          slug: base || 'workspace',
          metadata: { isPersonal: true }
        }
      })
      orgId = newOrg?.id ?? ''
    }
    await auth.api.setActiveOrganization({
      headers: hdrs,
      body: { organizationId: orgId }
    })
    full = await auth.api.getFullOrganization({ headers: hdrs })
  }

  const role =
    full?.members?.find((m: any) => m.userId === session.user.id)?.role ??
    'member'

  const teams = await listTeams()

  const sidebarCtx: SidebarCtx = {
    user: {
      id: session.user.id,
      email: session.user.email!,
      name: session.user.name ?? null,
      image: session.user.image ?? null
    },
    org: {
      id: full!.id,
      slug: full!.slug,
      name: full!.name,
      isPersonal: Boolean((full as any)?.metadata?.isPersonal)
    },
    membership: { role },
    teams
  }

  return (
    <div>
      <SidebarProvider>
        <AppSidebar variant="floating" side="left" ctx={sidebarCtx} />
        <SidebarInset className="container mx-auto px-12">
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear">
            <div className="flex flex-row w-full items-center justify-between gap-2">
              <div className="flex flex-row items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mr-2 data-[orientation=vertical]:h-4"
                />
                <SearchCommand />
              </div>
              <ModeToggle />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 pt-0">
            <div className="min-h-[100vh] flex-1 md:min-h-min pt-6">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
