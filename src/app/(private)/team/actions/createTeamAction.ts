// src/app/(private)/team/actions/createTeamAction.ts
'use server'

import { revalidateTag } from 'next/cache'

import { createTeam } from '@/app/(private)/team/data/team.mutations'
import { TEAMS_TAG } from '@/app/(private)/team/data/team.tags'
import { BusinessError } from '@/lib/errors/business-error'
import { R } from '@/types/result'

export async function createTeamAction(
  formData: FormData
): Promise<R<{ id: string }>> {
  try {
    const input = {
      name: String(formData.get('name') ?? '').trim(),
      slug: String(formData.get('slug') ?? '').trim()
    }
    const id = await createTeam(input.name, input.slug)
    revalidateTag(TEAMS_TAG)
    return { ok: true, data: { id } }
  } catch (err) {
    return {
      ok: false,
      code: (err as BusinessError)?.code ?? 'UNKNOWN',
      message: (err as BusinessError)?.message ?? 'Unexpected error'
    }
  }
}
