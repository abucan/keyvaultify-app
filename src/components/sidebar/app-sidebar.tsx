// src/components/sidebar/app-sidebar.tsx
'use client'
import * as React from 'react'
import { BookOpen, Home, Key, Settings2, Users } from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from '@/components/ui/sidebar'
import { User } from '@/lib/better-auth/auth'
import { orgDash } from '@/lib/router/path'
import { Team } from '@/types/auth'

import { NavMain } from './nav-main'
import { NavProjects } from './nav-projects'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'

export function AppSidebar({
  user,
  teams,
  orgId,
  orgSlug,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: User | null
  teams: Team[]
  orgId: string | null
  orgSlug: string | null
}) {
  const data = React.useMemo(() => {
    const base = (p = '/') => orgDash(orgSlug ?? '', p)
    return {
      navMain: [
        { title: 'Dashboard', url: base('/'), icon: Home },
        {
          title: 'Team',
          url: base('/team'),
          icon: Users,
          items: [
            { title: 'Members', url: base('/team/members') },
            { title: 'Invitations', url: base('/team/invitations') },
            { title: 'Settings', url: base('/team/settings') }
          ]
        },
        {
          title: 'Settings',
          url: base('/settings'),
          icon: Settings2,
          items: [
            { title: 'General', url: base('/settings/general') },
            { title: 'Billing', url: base('/settings/billing') },
            { title: 'Danger', url: base('/settings/danger') }
          ]
        }
      ],
      projects: [{ name: 'Keyvaultify (DEMO)', url: '#', icon: Key }],
      docs: { title: 'Documentation', url: '#', icon: BookOpen }
    }
  }, [orgSlug])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} orgId={orgId} orgSlug={orgSlug} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
