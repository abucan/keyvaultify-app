// src/app/(private)/settings/developer/actions/revokeApiTokenAction.ts
'use server'

import { revalidatePath } from 'next/cache'

import { revokeApiToken } from '@/app/(private)/settings/developer/data/tokens.mutations'
import { R } from '@/types/result'

export async function revokeApiTokenAction(tokenId: string): Promise<R<void>> {
  try {
    await revokeApiToken(tokenId)

    revalidatePath('/settings/developer')

    return { ok: true }
  } catch (error: any) {
    return {
      ok: false,
      code: error?.code ?? 'UNKNOWN',
      message: error?.message ?? 'Failed to revoke API token'
    }
  }
}
