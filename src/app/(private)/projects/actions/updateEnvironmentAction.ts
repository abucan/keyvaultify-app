// src/app/(private)/projects/actions/updateEnvironmentAction.ts
'use server'

import { revalidatePath } from 'next/cache'

import { updateEnvironment } from '@/app/(private)/projects/data/projects.mutations'
import { R } from '@/types/result'

export async function updateEnvironmentAction(
  envId: string,
  projectId: string,
  name?: string,
  description?: string
): Promise<R<void>> {
  try {
    await updateEnvironment(envId, { name, description })

    revalidatePath(`/projects/${projectId}`)
    revalidatePath(`/projects/${projectId}/environments/${envId}`)

    return { ok: true }
  } catch (error: any) {
    return {
      ok: false,
      code: error?.code ?? 'UNKNOWN',
      message: error?.message ?? 'Failed to update environment'
    }
  }
}
