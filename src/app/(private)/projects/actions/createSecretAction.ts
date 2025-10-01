// src/app/(private)/projects/actions/createSecretAction.ts
'use server'

import { revalidatePath } from 'next/cache'

import { createSecret } from '@/app/(private)/projects/data/projects.mutations'
import { addSecretFormSchema } from '@/lib/zod-schemas/form-schema'
import { R } from '@/types/result'

export async function createSecretAction(
  environmentId: string,
  projectId: string,
  key: string,
  value: string
): Promise<R<{ secretId: string }>> {
  try {
    const parsed = addSecretFormSchema.safeParse({ key, value })

    if (!parsed.success) {
      return {
        ok: false,
        code: 'INVALID_INPUT',
        message: parsed.error.message ?? 'Invalid input'
      }
    }

    const secretId = await createSecret(environmentId, key, value)

    revalidatePath(`/projects/${projectId}`)
    revalidatePath(`/projects/${projectId}/environments/${environmentId}`)

    return {
      ok: true,
      data: { secretId }
    }
  } catch (error: any) {
    return {
      ok: false,
      code: error?.code ?? 'UNKNOWN',
      message: error?.message ?? 'Failed to create secret'
    }
  }
}
