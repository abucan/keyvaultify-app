// src/app/(app)/layout.tsx
import 'server-only'

import { cookies, headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'

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

import { listTeams } from './teams/actions'

export const dynamic = 'force-dynamic'

export default async function AppLayout({
  params,
  children
}: {
  params: Promise<{ orgSlug: string }>
  children: React.ReactNode
}) {
  const { orgSlug } = await params
  const hdrs = await headers()

  const session = await auth.api.getSession({ headers: hdrs })
  if (!session) {
    redirect('/signin')
  }

  try {
    console.log('orgSlug', orgSlug)
    await auth.api.setActiveOrganization({
      headers: hdrs,
      body: { organizationSlug: orgSlug }
    })
  } catch {
    console.log('orgSlug not found', orgSlug)
    notFound()
  }

  const teams = await listTeams()

  //  ⨯ Error: Cookies can only be modified in a Server Action or Route Handler. Read more: https://nextjs.org/docs/app/api-reference/functions/cookies#options
  /*   ;(await cookies()).set('kv_last_org', orgSlug, {
    path: '/',
    httpOnly: false
  }) */

  return (
    <div>
      <SidebarProvider>
        <AppSidebar
          variant="floating"
          side="left"
          user={session?.user ?? null}
          teams={teams}
          orgSlug={orgSlug}
          orgId={session?.session?.activeOrganizationId ?? null}
        />
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
