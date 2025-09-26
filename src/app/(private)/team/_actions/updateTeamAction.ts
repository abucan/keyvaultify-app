// src/app/(private)/team/_actions/updateTeamAction.ts
'use server'

import { revalidateTag } from 'next/cache'

import { updateTeam } from '@/app/(private)/team/_data/team.mutations'
import { TEAMS_TAG } from '@/app/(private)/team/_data/team.tags'
import { mapError } from '@/lib/errors/mapError'
import { R } from '@/types/result'

export async function updateTeamAction(formData: FormData): Promise<R> {
  const input = {
    name: String(formData.get('name') ?? '').trim(),
    slug: String(formData.get('slug') ?? '').trim(),
    logo: String(formData.get('logo') ?? '').trim(),
    default_role: String(formData.get('default_role') ?? '').trim()
  }

  try {
    await updateTeam(input.name, input.slug, input.logo, input.default_role)
    revalidateTag(TEAMS_TAG)
    return { ok: true }
  } catch (error: any) {
    const { code, message } = mapError(error)
    return { ok: false, code, message }
  }
}
