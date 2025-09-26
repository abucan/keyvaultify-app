// src/app/(private)/team/_actions/removeMemberAction.ts
'use server'

import { revalidateTag } from 'next/cache'

import { removeMember } from '@/app/(private)/team/_data/team.mutations'
import { TEAMS_TAG } from '@/app/(private)/team/_data/team.tags'
import { BusinessError } from '@/lib/errors/business-error'
import { R } from '@/types/result'

export async function removeMemberAction(formData: FormData): Promise<R> {
  const memberId = String(formData.get('memberId') ?? '').trim()
  try {
    await removeMember(memberId)
    revalidateTag(TEAMS_TAG)
    return { ok: true }
  } catch (error: any) {
    return {
      ok: false,
      code: (error as BusinessError)?.code ?? 'UNKNOWN',
      message: (error as BusinessError)?.message ?? 'Unexpected error'
    }
  }
}
