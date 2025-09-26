// src/app/(private)/team/_actions/switchTeamAction.ts
'use server'

import { redirect } from 'next/navigation'

import { switchTeam } from '@/app/(private)/team/_data/team.mutations'
import { mapError } from '@/lib/errors/mapError'
import { R } from '@/types/result'

export async function switchTeamAction(targetOrgId: string): Promise<R> {
  try {
    await switchTeam(targetOrgId)
  } catch (error: any) {
    const { code, message } = mapError(error)
    return { ok: false, code, message }
  }
  redirect('/dashboard')
}
