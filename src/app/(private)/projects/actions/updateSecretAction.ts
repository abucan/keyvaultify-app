// src/app/(private)/projects/actions/updateSecretAction.ts
'use server'

import { revalidatePath } from 'next/cache'

import { updateSecret } from '@/app/(private)/projects/data/projects.mutations'
import { R } from '@/types/result'

export async function updateSecretAction(
  secretId: string,
  environmentId: string,
  projectId: string,
  key?: string,
  value?: string
): Promise<R<void>> {
  try {
    await updateSecret(secretId, key, value)

    revalidatePath(`/projects/${projectId}`)
    revalidatePath(`/projects/${projectId}/environments/${environmentId}`)

    return { ok: true }
  } catch (error: any) {
    return {
      ok: false,
      code: error?.code ?? 'UNKNOWN',
      message: error?.message ?? 'Failed to update secret'
    }
  }
}
