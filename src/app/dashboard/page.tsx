'use client'

import { Button } from '@/components/ui/button'
import { revokeSessions, signOut } from '@/lib/auth-client'
import { redirect } from 'next/navigation'

export default function Dashboard() {
  const handleSignOut = async () => {
    await revokeSessions() // TODO: change in production
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          console.log('Signed out successfully')
          redirect('/')
        }
      }
    })
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <Button onClick={handleSignOut}>Sign Out</Button>
    </div>
  )
}
