// src/app/(app)/settings/actions.ts
'use server'

import {
  deleteUserProfile as _delete,
  updateUserProfile as _update
} from '@/lib/auth/profile'

export async function updateUserProfileAction(values: {
  name?: string
  image?: string
}) {
  await _update(values)
}

export async function deleteUserProfileAction() {
  await _delete()
}
