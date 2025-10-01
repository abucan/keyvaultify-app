// src/app/(private)/projects/actions/deleteSecretAction.ts
'use server'

import { revalidatePath } from 'next/cache'

import { deleteSecret } from '@/app/(private)/projects/data/projects.mutations'
import { R } from '@/types/result'

export async function deleteSecretAction(
  secretId: string,
  environmentId: string,
  projectId: string
): Promise<R<void>> {
  try {
    await deleteSecret(secretId)

    revalidatePath(`/projects/${projectId}`)
    revalidatePath(`/projects/${projectId}/environments/${environmentId}`)

    return { ok: true }
  } catch (error: any) {
    return {
      ok: false,
      code: error?.code ?? 'UNKNOWN',
      message: error?.message ?? 'Failed to delete secret'
    }
  }
}
