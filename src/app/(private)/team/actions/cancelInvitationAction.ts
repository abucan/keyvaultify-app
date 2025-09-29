// src/app/(private)/team/actions/cancelInvitationAction.ts
'use server'

import { revalidateTag } from 'next/cache'

import { cancelInvitation } from '@/app/(private)/team/data/team.mutations'
import { TEAM_INVITATIONS_TAG } from '@/app/(private)/team/data/team.tags'
import { BusinessError } from '@/lib/errors/business-error'
import { R } from '@/types/result'

export async function cancelInvitationAction(
  formData: FormData
): Promise<R<{ email: string }>> {
  const invitationId = String(formData.get('invitationId') ?? '').trim()

  try {
    const res = await cancelInvitation(invitationId)
    revalidateTag(TEAM_INVITATIONS_TAG)
    return { ok: true, data: res }
  } catch (error: any) {
    return {
      ok: false,
      code: (error as BusinessError)?.code ?? 'UNKNOWN',
      message: (error as BusinessError)?.message ?? 'Unexpected error'
    }
  }
}
