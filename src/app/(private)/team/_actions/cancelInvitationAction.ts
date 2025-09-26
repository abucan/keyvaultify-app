// src/app/(private)/team/_actions/cancelInvitationAction.ts
'use server'

import { revalidateTag } from 'next/cache'

import { cancelInvitation } from '@/app/(private)/team/_data/team.mutations'
import { TEAMS_TAG } from '@/app/(private)/team/_data/team.tags'
import { BusinessError } from '@/lib/errors/business-error'
import { R } from '@/types/result'

export async function cancelInvitationAction(
  formData: FormData
): Promise<R<{ email: string }>> {
  const invitationId = String(formData.get('invitationId') ?? '').trim()

  try {
    const res = await cancelInvitation(invitationId)
    revalidateTag(TEAMS_TAG)
    return { ok: true, data: res }
  } catch (error: any) {
    return {
      ok: false,
      code: (error as BusinessError)?.code ?? 'UNKNOWN',
      message: (error as BusinessError)?.message ?? 'Unexpected error'
    }
  }
}
