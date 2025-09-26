// src/app/(private)/team/actions/deleteTeamAction.ts
'use server'

import { revalidateTag } from 'next/cache'

import { deleteTeam } from '@/app/(private)/team/data/team.mutations'
import { TEAMS_TAG } from '@/app/(private)/team/data/team.tags'
import { mapError } from '@/lib/errors/mapError'
import { R } from '@/types/result'

export async function deleteTeamAction(): Promise<R> {
  try {
    await deleteTeam()
    revalidateTag(TEAMS_TAG)
    return { ok: true }
  } catch (error: any) {
    const { code, message } = mapError(error)
    return { ok: false, code, message }
  }
}
