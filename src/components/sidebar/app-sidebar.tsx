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
import { AppSidebarProps } from '@/types'

import { NavMain } from './nav-main'
import { NavProjects } from './nav-projects'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'

export function AppSidebar({
  ctx,
  ...props
}: React.ComponentProps<typeof Sidebar> & AppSidebarProps) {
  const data = React.useMemo(() => {
    return {
      navMain: [
        { title: 'Dashboard', url: '/dashboard', icon: Home },
        {
          title: 'Team',
          url: '/team',
          icon: Users,
          items: [
            { title: 'Members', url: '/team/members' },
            { title: 'Invitations', url: '/team/invitations' },
            { title: 'Settings', url: '/team/settings' }
          ]
        },
        {
          title: 'Settings',
          url: '/settings',
          icon: Settings2,
          items: [
            { title: 'General', url: '/settings/general' },
            { title: 'Billing', url: '/settings/billing' },
            { title: 'Danger', url: '/settings/danger' }
          ]
        }
      ],
      projects: [{ name: 'Keyvaultify (DEMO)', url: '#', icon: Key }],
      docs: { title: 'Documentation', url: '#', icon: BookOpen }
    }
  }, [])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={ctx.teams} orgId={ctx.org.id} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={ctx.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
