// src/app/(private)/team/actions/removeMemberAction.ts
'use server'

import { revalidateTag } from 'next/cache'

import { removeMember } from '@/app/(private)/team/data/team.mutations'
import { TEAM_MEMBERS_TAG } from '@/app/(private)/team/data/team.tags'
import { BusinessError } from '@/lib/errors/business-error'
import { R } from '@/types/result'

export async function removeMemberAction(formData: FormData): Promise<R> {
  const memberId = String(formData.get('memberId') ?? '').trim()
  try {
    await removeMember(memberId)
    revalidateTag(TEAM_MEMBERS_TAG)
    return { ok: true }
  } catch (error: any) {
    return {
      ok: false,
      code: (error as BusinessError)?.code ?? 'UNKNOWN',
      message: (error as BusinessError)?.message ?? 'Unexpected error'
    }
  }
}
