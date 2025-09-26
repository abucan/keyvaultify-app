// src/components/sidebar/team-switcher.tsx
'use client'
import * as React from 'react'
import { useTransition } from 'react'
import Image from 'next/image'
import { ChevronsUpDown, Plus } from 'lucide-react'

import { switchTeamAction } from '@/app/(private)/team/_actions/switchTeamAction'
import { AddTeamForm } from '@/app/(private)/team/_components/AddTeamForm'
import { AddDialog } from '@/components/shared/AddDialog'
import { toastRes } from '@/components/toast-result'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar'
import { Team } from '@/types/auth'

export function TeamSwitcher({
  teams,
  orgId
}: {
  teams: Team[]
  orgId: string | null
}) {
  const [pending, startTransition] = useTransition()

  const { isMobile } = useSidebar()

  const [addTeamDialogOpen, setAddTeamDialogOpen] = React.useState(false)

  const activeTeam = React.useMemo(
    () => teams.find(t => t.id === orgId) ?? teams[0],
    [teams, orgId]
  )

  return (
    <>
      <AddDialog
        open={addTeamDialogOpen}
        onOpenChange={setAddTeamDialogOpen}
        title="Add team"
        description="Add a new team to your account."
      >
        <AddTeamForm setAddTeamDialogOpen={setAddTeamDialogOpen} />
      </AddDialog>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
              >
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image
                    src={activeTeam?.logo ?? '/shadcn.jfif'}
                    alt={activeTeam?.name ?? 'team logo'}
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium font-bricolage-grotesque">
                    {activeTeam?.name}
                  </span>
                  <span className="truncate text-xs font-bricolage-grotesque">
                    {/* TODO: Add team subscription type */}
                    Hobby
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              align="start"
              side={isMobile ? 'bottom' : 'right'}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                Teams
              </DropdownMenuLabel>
              {teams.map(team => (
                <DropdownMenuItem
                  key={team.slug}
                  onClick={() => {
                    startTransition(async () => {
                      const res = await switchTeamAction(team.id)
                      toastRes(res, {
                        errors: {
                          MISSING_ORG_ID: 'Missing team id.',
                          NOT_FOUND_OR_NO_ACCESS:
                            "You don't have access to that team."
                        }
                      })
                    })
                  }}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <Image
                      src={team.logo ?? '/shadcn.jfif'}
                      alt={team.name ?? 'team logo'}
                      width={32}
                      height={32}
                      className="rounded-md"
                    />
                  </div>
                  {team.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 p-2"
                onClick={() => setAddTeamDialogOpen(true)}
                disabled={pending}
              >
                <div className="flex flex-row items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                    <Plus className="size-4" />
                  </div>
                  <div className="text-muted-foreground font-medium font-bricolage-grotesque">
                    Add team
                  </div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  )
}
