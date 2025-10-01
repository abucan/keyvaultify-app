// src/app/(private)/projects/actions/createProjectAction.ts
'use server'

import { revalidatePath } from 'next/cache'

import { createProject } from '@/app/(private)/projects/data/projects.mutations'
import { addProjectFormSchema } from '@/lib/zod-schemas/form-schema'
import { R } from '@/types/result'

export async function createProjectAction(
  name: string,
  description?: string,
  slug?: string
): Promise<R<{ projectId: string }>> {
  try {
    const parsed = addProjectFormSchema.safeParse({ name, description, slug })

    if (!parsed.success) {
      return {
        ok: false,
        code: 'INVALID_INPUT',
        message: parsed.error.message ?? 'Invalid input'
      }
    }

    const projectId = await createProject(name, description, slug)

    revalidatePath('/projects')
    revalidatePath('/dashboard')

    return {
      ok: true,
      data: { projectId }
    }
  } catch (error: any) {
    return {
      ok: false,
      code: error?.code ?? 'UNKNOWN',
      message: error?.message ?? 'Failed to create project'
    }
  }
}
