// src/app/(private)/layout.tsx
import 'server-only'

import { getAuthContext } from '@/app/(private)/get-layout-context'
import { ModeToggle } from '@/components/shared/ModeToggle'
import { SearchCommand } from '@/components/shared/SearchCommand'
import { AppSidebar } from '@/components/sidebar/app-sidebar'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { ctx } = await getAuthContext()

  return (
    <div>
      <SidebarProvider>
        <AppSidebar variant="floating" side="left" ctx={ctx} />
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
