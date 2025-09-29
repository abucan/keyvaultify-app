// src/app/(private)/team/actions/leaveTeamAction.ts
'use server'

import { revalidateTag } from 'next/cache'

import { leaveTeam } from '@/app/(private)/team/data/team.mutations'
import {
  TEAM_MEMBERS_TAG,
  TEAMS_TAG
} from '@/app/(private)/team/data/team.tags'
import { mapError } from '@/lib/errors/mapError'
import { R } from '@/types/result'

export async function leaveTeamAction(): Promise<R> {
  try {
    await leaveTeam()
    revalidateTag(TEAMS_TAG)
    revalidateTag(TEAM_MEMBERS_TAG)
    return { ok: true }
  } catch (error: any) {
    const { code, message } = mapError(error)
    return { ok: false, code, message }
  }
}
