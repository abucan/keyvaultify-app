/* eslint-disable @typescript-eslint/no-explicit-any */
import { listTeams } from '@/server/team.actions'

type SidebarCtx = {
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
  teams: Awaited<ReturnType<typeof listTeams>>
}

type AppSidebarProps = {
  ctx: {
    user: {
      id: string
      email: string
      name: string | null
      image: string | null
    }
    org: { id: string; slug: string; name: string; isPersonal?: boolean }
    membership: { role: 'owner' | 'admin' | 'member' }
    teams: any[]
  }
}
