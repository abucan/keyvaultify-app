// src/app/(private)/projects/actions/deleteProjectAction.ts
'use server'

import { revalidatePath } from 'next/cache'

import { deleteProject } from '@/app/(private)/projects/data/projects.mutations'
import { R } from '@/types/result'

export async function deleteProjectAction(projectId: string): Promise<R<void>> {
  try {
    await deleteProject(projectId)

    revalidatePath('/projects')
    revalidatePath('/dashboard')

    return { ok: true }
  } catch (error: any) {
    return {
      ok: false,
      code: error?.code ?? 'UNKNOWN',
      message: error?.message ?? 'Failed to delete project'
    }
  }
}
