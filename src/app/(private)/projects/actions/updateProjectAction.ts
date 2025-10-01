// src/app/(private)/projects/actions/updateProjectAction.ts
'use server'

import { revalidatePath } from 'next/cache'

import { updateProject } from '@/app/(private)/projects/data/projects.mutations'
import { R } from '@/types/result'

export async function updateProjectAction(
  projectId: string,
  name?: string,
  description?: string,
  slug?: string
): Promise<R<void>> {
  try {
    await updateProject(projectId, { name, description, slug })

    revalidatePath('/projects')
    revalidatePath(`/projects/${projectId}`)
    revalidatePath('/dashboard')

    return { ok: true }
  } catch (error: any) {
    return {
      ok: false,
      code: error?.code ?? 'UNKNOWN',
      message: error?.message ?? 'Failed to update project'
    }
  }
}
