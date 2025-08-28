'use client'

import * as React from 'react'
import {
  AudioWaveform,
  BookOpen,
  Command,
  GalleryVerticalEnd,
  Home,
  Key,
  Settings2
} from 'lucide-react'

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
      title: 'Team Settings',
      url: '/teams/settings',
      icon: Settings2
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
  ...props
}: React.ComponentProps<typeof Sidebar> & { teams: Team[] }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
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
