// src/app/(private)/team/actions/inviteMemberAction.ts
'use server'

import { revalidateTag } from 'next/cache'

import { inviteMember } from '@/app/(private)/team/data/team.mutations'
import { TEAM_INVITATIONS_TAG } from '@/app/(private)/team/data/team.tags'
import { BusinessError } from '@/lib/errors/business-error'
import { R } from '@/types/result'

export async function inviteMemberAction(
  formData: FormData
): Promise<R<{ email: string }>> {
  try {
    const input = {
      email: String(formData.get('email') ?? '').trim(),
      role: String(formData.get('role') ?? 'member').trim()
    }

    const res = await inviteMember(input.email, input.role)
    revalidateTag(TEAM_INVITATIONS_TAG)
    return { ok: true, data: res }
  } catch (error) {
    return {
      ok: false,
      code: (error as BusinessError)?.code ?? 'UNKNOWN',
      message: (error as BusinessError)?.message ?? 'Unexpected error'
    }
  }
}
