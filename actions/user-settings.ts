'use server'

import { authClient, getSession } from '@/lib/auth-client'
import { unauthorized } from 'next/navigation'

export async function updateUserProfile({
  image,
  name
}: {
  image: string
  name: string
}) {
  const session = await getSession()
  if (!session) {
    unauthorized()
  }

  await authClient.updateUser({
    name,
    image
  })
}
