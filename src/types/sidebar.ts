// src/types/sidebar.ts
import { Team } from './auth'

export type SidebarProject = {
  id: string
  name: string
}

export type SidebarCtx = {
  user: {
    id: string
    email: string
    name: string | null
    image: string | null
  }
  org: {
    id: string
    slug: string
    name: string
    isPersonal?: boolean
  }
  membership: {
    role: 'owner' | 'admin' | 'member'
  }
  teams: Team[] | undefined
  projects: SidebarProject[]
}

export type AppSidebarProps = {
  ctx: {
    user: {
      id: string
      email: string
      name: string | null
      image: string | null
    }
    org: { id: string; slug: string; name: string; isPersonal?: boolean }
    membership: { role: 'owner' | 'admin' | 'member' }
    teams: Team[] | undefined
    projects: SidebarProject[]
  }
}
