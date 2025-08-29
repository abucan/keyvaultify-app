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
import { Team } from '@/types/auth'

import { NavMain } from './nav-main'
import { NavProjects } from './nav-projects'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/shadcn.jfif'
  },
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: Home
      // isActive: true
    },
    {
      title: 'Documentation',
      url: '#',
      icon: BookOpen,
      items: [
        {
          title: 'Introduction',
          url: '#'
        },
        {
          title: 'Get Started',
          url: '#'
        },
        {
          title: 'Tutorials',
          url: '#'
        },
        {
          title: 'Changelog',
          url: '#'
        }
      ]
    },
    {
      title: 'Teams',
      url: '/teams',
      icon: Users,
      items: [
        {
          title: 'Members',
          url: '/teams/members'
        },
        {
          title: 'Invitations',
          url: '/teams/invitations'
        },
        {
          title: 'Settings',
          url: '/teams/settings'
        }
      ]
    },
    {
      title: 'Settings',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: 'General',
          url: '/settings/general'
        },
        {
          title: 'Billing',
          url: '/settings/billing'
        },
        {
          title: 'Danger',
          url: '/settings/danger'
        }
      ]
    }
  ],
  projects: [
    {
      name: 'Keyvaultify',
      url: '/projects/keyvaultify',
      icon: Key
    }
  ]
}

export function AppSidebar({
  teams,
  orgId,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  teams: Team[]
  orgId: string | null
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} orgId={orgId} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
