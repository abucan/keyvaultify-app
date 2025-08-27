// src/lib/auth/profile.ts
import 'server-only'

import { headers } from 'next/headers'
import { unauthorized } from 'next/navigation'

import { auth } from '@/lib/better-auth/auth'

export async function updateUserProfile({
  image,
  name
}: {
  image?: string
  name?: string
}) {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (!session) {
    unauthorized()
  }

  await auth.api.updateUser({
    body: {
      ...(name ? { name } : {}),
      ...(image ? { image } : {})
    },
    headers: await headers()
  })
}

export async function deleteUserProfile() {
  'use server'
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    unauthorized()
  }

  await auth.api.deleteUser({
    body: {
      callbackURL: '/signin'
    },
    headers: await headers()
  })
}
