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
  teams,
  orgSlug,
  orgId,
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  teams: Team[]
  orgSlug: string | null
  orgId: string | null
  user: User | null
}) {
  const data = React.useMemo(() => {
    const base = (p = '/') => orgDash(orgSlug ?? '', p)
    return {
      navMain: [
        { title: 'Dashboard', url: base('/'), icon: Home },
        {
          title: 'Teams',
          url: base('/teams'),
          icon: Users,
          items: [
            { title: 'Members', url: base('/teams/members') },
            { title: 'Invitations', url: base('/teams/invitations') },
            { title: 'Settings', url: base('/teams/settings') }
          ]
        },
        {
          title: 'Settings',
          url: '#',
          icon: Settings2,
          items: [
            { title: 'General', url: base('/settings/general') },
            { title: 'Billing', url: base('/settings/billing') },
            { title: 'Danger', url: base('/settings/danger') }
          ]
        }
      ],
      projects: [
        { name: 'Keyvaultify', url: base('/projects/keyvaultify'), icon: Key }
      ],
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
