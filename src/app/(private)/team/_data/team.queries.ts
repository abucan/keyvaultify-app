import 'server-only'

import { unstable_cache } from 'next/cache'
import { headers } from 'next/headers'

import { auth } from '@/lib/better-auth/auth'
import { Team } from '@/types/auth'

import { TEAMS_TAG } from './team.tags'

const _getTeamsCached = unstable_cache(
  async (_headers: Headers) => {
    const orgs = await auth.api.listOrganizations({ headers: _headers })
    return orgs ?? []
  },
  [TEAMS_TAG],
  { tags: [TEAMS_TAG] }
)

export async function getTeams(): Promise<Team[]> {
  const _headers = await headers()
  return _getTeamsCached(_headers)
}
