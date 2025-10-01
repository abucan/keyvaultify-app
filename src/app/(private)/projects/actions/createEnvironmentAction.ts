// src/app/(private)/projects/actions/createEnvironmentAction.ts
'use server'

import { revalidatePath } from 'next/cache'

import { createEnvironment } from '@/app/(private)/projects/data/projects.mutations'
import { addEnvironmentFormSchema } from '@/lib/zod-schemas/form-schema'
import { R } from '@/types/result'

export async function createEnvironmentAction(
  projectId: string,
  name: string,
  description?: string
): Promise<R<{ environmentId: string }>> {
  try {
    const parsed = addEnvironmentFormSchema.safeParse({ name, description })

    if (!parsed.success) {
      return {
        ok: false,
        code: 'INVALID_INPUT',
        message: parsed.error.message ?? 'Invalid input'
      }
    }

    const environmentId = await createEnvironment(projectId, name, description)

    revalidatePath(`/projects/${projectId}`)

    return {
      ok: true,
      data: { environmentId }
    }
  } catch (error: any) {
    return {
      ok: false,
      code: error?.code ?? 'UNKNOWN',
      message: error?.message ?? 'Failed to create environment'
    }
  }
}
