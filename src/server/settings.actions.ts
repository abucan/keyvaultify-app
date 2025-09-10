// src/server/settings.actions.ts
'use server'
import {
  deleteUserProfile as _delete,
  updateUserProfile as _update
} from '@/lib/auth/profile'
import { R } from '@/types/api-results'

export async function updateUserProfileAction(values: {
  name?: string
  image?: string
}) {
  await _update(values)
}

export async function deleteUserProfileAction(): Promise<R> {
  return await _delete()
}
