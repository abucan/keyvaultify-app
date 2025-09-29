// src/app/(private)/team/actions/updateMemberRoleAction.ts
'use server'

import { revalidateTag } from 'next/cache'

import { updateMemberRole } from '@/app/(private)/team/data/team.mutations'
import { TEAM_MEMBERS_TAG } from '@/app/(private)/team/data/team.tags'
import { BusinessError } from '@/lib/errors/business-error'
import { R } from '@/types/result'

export async function updateMemberRoleAction(
  formData: FormData
): Promise<R<{ role: string }>> {
  const input = {
    memberId: String(formData.get('memberId') ?? '').trim(),
    role: String(formData.get('role') ?? 'member').trim()
  }

  try {
    const res = await updateMemberRole(input.memberId, input.role)
    revalidateTag(TEAM_MEMBERS_TAG)
    return { ok: true, data: res }
  } catch (error: any) {
    return {
      ok: false,
      code: (error as BusinessError)?.code ?? 'UNKNOWN',
      message: (error as BusinessError)?.message ?? 'Unexpected error'
    }
  }
}
