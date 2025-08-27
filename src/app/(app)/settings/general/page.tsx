// src/app/(app)/settings/general/page.tsx
import { headers } from 'next/headers'

import { updateUserProfile } from '@/lib/auth/profile'
import { auth } from '@/lib/better-auth/auth'

import { GeneralSettingsForm } from './components/GeneralSettingsForm'

export default async function GeneralSettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  const user = session?.user

  if (!user) {
    // TODO: Redirect to login page, or show a message
    return <div>Not authenticated</div>
  }

  return (
    <GeneralSettingsForm
      initialUsername={user.name ?? ''}
      initialImage={user.image ?? ''}
      email={user.email}
      updateUserProfile={updateUserProfile}
    />
  )
}
