// src/app/(private)/projects/actions/deleteEnvironmentAction.ts
'use server'

import { revalidatePath } from 'next/cache'

import { deleteEnvironment } from '@/app/(private)/projects/data/projects.mutations'
import { R } from '@/types/result'

export async function deleteEnvironmentAction(
  envId: string,
  projectId: string
): Promise<R<void>> {
  try {
    await deleteEnvironment(envId)

    revalidatePath(`/projects/${projectId}`)

    return { ok: true }
  } catch (error: any) {
    return {
      ok: false,
      code: error?.code ?? 'UNKNOWN',
      message: error?.message ?? 'Failed to delete environment'
    }
  }
}
