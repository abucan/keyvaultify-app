// src/app/(private)/team/_actions/resendInvitationAction.ts
'use server'

import { revalidateTag } from 'next/cache'

import { resendInvitation } from '@/app/(private)/team/_data/team.mutations'
import { TEAMS_TAG } from '@/app/(private)/team/_data/team.tags'
import { BusinessError } from '@/lib/errors/business-error'
import { R } from '@/types/result'

export async function resendInvitationAction(
  formData: FormData
): Promise<R<{ email: string }>> {
  const input = {
    email: String(formData.get('email') ?? '').trim(),
    role: String(formData.get('role') ?? 'member').trim()
  }

  try {
    const res = await resendInvitation(input.email, input.role)
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
