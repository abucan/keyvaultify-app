// src/app/(private)/get-layout-context.ts
import 'server-only'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { getTeams } from '@/app/(private)/team/data/team.queries'
import { auth } from '@/lib/better-auth/auth'
import type { SidebarCtx } from '@/types/sidebar'

type Member = { userId: string; role: 'owner' | 'admin' | 'member' }
type FullOrg = {
  id: string
  slug: string
  name: string
  metadata?: unknown
  members?: Member[]
}

// TODO: Move Later
function parseMeta(meta: unknown): Record<string, unknown> {
  if (typeof meta === 'string') {
    try {
      return JSON.parse(meta)
    } catch {
      return {}
    }
  }
  return (meta as Record<string, unknown>) ?? {}
}

export async function getAuthContext(): Promise<{
  ctx: SidebarCtx
}> {
  const _headers = await headers()

  const session = await auth.api.getSession({ headers: _headers })
  if (!session?.user) redirect('/signin')

  const full = (await auth.api
    .getFullOrganization({ headers: _headers })
    .catch(() => null)) as FullOrg | null

  if (!full?.id) {
    console.log('No full org id')
    redirect('/onboarding')
  }

  const role =
    full.members?.find(m => m.userId === session.user!.id)?.role ?? 'member'

  const teams = await getTeams()

  const meta = parseMeta(full.metadata)
  const ctx: SidebarCtx = {
    user: {
      id: session.user!.id,
      email: session.user!.email!,
      name: session.user!.name ?? null,
      image: session.user!.image ?? null
    },
    org: {
      id: full.id,
      slug: full.slug,
      name: full.name,
      isPersonal: Boolean(meta?.isPersonal)
    },
    membership: { role },
    teams: teams?.ok ? teams.data : []
  }

  return { ctx }
}
