// src/app/(private)/settings/developer/actions/createApiTokenAction.ts
'use server'

import { revalidatePath } from 'next/cache'

import { createApiToken } from '@/app/(private)/settings/developer/data/tokens.mutations'
import { R } from '@/types/result'

export async function createApiTokenAction(
  name: string,
  projectId?: string | null,
  expiresInDays?: number | null
): Promise<R<{ token: string; tokenId: string }>> {
  try {
    if (!name || name.trim().length === 0) {
      return {
        ok: false,
        code: 'INVALID_INPUT',
        message: 'Token name is required'
      }
    }

    const result = await createApiToken(name, projectId, expiresInDays)

    revalidatePath('/settings/developer')

    return {
      ok: true,
      data: result
    }
  } catch (error: any) {
    return {
      ok: false,
      code: error?.code ?? 'UNKNOWN',
      message: error?.message ?? 'Failed to create API token'
    }
  }
}
