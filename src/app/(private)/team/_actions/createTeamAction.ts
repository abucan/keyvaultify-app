'use server'

import { revalidateTag } from 'next/cache'

import { BusinessError } from '@/lib/errors/business-error'
import { R } from '@/types/result'

import { createTeam } from '../_data/team.mutations'
import { TEAMS_TAG } from '../_data/team.tags'

export async function createTeamAction(
  formData: FormData
): Promise<R<{ id: string }>> {
  try {
    const name = String(formData.get('name') ?? '').trim()
    const slug = String(formData.get('slug') ?? '').trim()
    const id = await createTeam(name, slug)
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
