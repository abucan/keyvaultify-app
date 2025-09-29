// src/app/(private)/settings/general/page.tsx
import { headers } from 'next/headers'
import { unauthorized } from 'next/navigation'

import { updateUserProfileAction } from '@/app/(private)/settings/actions/updateUserProfileAction'
import { GeneralSettingsForm } from '@/app/(private)/settings/components/GeneralSettingsForm'
import { auth } from '@/lib/better-auth/auth'

export default async function GeneralSettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  const user = session?.user

  if (!user) {
    unauthorized()
  }
  // TODO: add what provider it is
  return (
    <GeneralSettingsForm
      initialUsername={user?.name}
      initialEmail={user?.email}
      initialImage={user?.image ?? '/avatars/shadcn.jfif'}
      action={updateUserProfileAction}
    />
  )
}
