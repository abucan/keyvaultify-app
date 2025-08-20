import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
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
      email={user.email}
      initialImage={user.image ?? ''}
    />
  )
}
