// src/components/auth-form/OAuthButton.tsx
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { createAuthClient } from 'better-auth/client'
import { ChevronRight } from 'lucide-react'

import { Badge } from '../ui/badge'
import { Button } from '../ui/button'

type OAuthButtonProps = {
  provider: 'google' | 'github'
  text: string
  icon: string
  handleLastUsed: (provider: 'google' | 'github' | 'email') => void
}

export function OAuthButton({
  provider,
  text,
  icon,
  handleLastUsed
}: OAuthButtonProps) {
  const auth = createAuthClient()

  const handleGithubSignIn = async () => {
    try {
      await auth.signIn.social({
        provider: 'github'
      })
      handleLastUsed('github')
    } catch (error) {
      console.error('Error signing in with GitHub:', error)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await auth.signIn.social({
        provider: 'google'
      })
      handleLastUsed('google')
    } catch (error) {
      console.error('Error signing in with Google:', error)
    }
  }

  function useLocalStorage(key: string) {
    const [value, setValue] = useState<string | null>(null)

    useEffect(() => {
      setValue(localStorage.getItem(key))
    }, [key])

    return value
  }

  const lastUsedProvider = useLocalStorage('lastUsedProvider')

  return (
    <Button
      className="justify-between rounded-full font-bricolage-grotesque relative"
      size={'lg'}
      variant={'outline'}
      type="button"
      onClick={provider === 'github' ? handleGithubSignIn : handleGoogleSignIn}
    >
      {lastUsedProvider === provider && (
        <Badge className="absolute -top-2 right-10 rounded-full font-bricolage-grotesque">
          Last used
        </Badge>
      )}
      <Image src={`/icons/${icon}.svg`} alt={provider} width={16} height={16} />
      {text}
      <ChevronRight className="text-muted-foreground" />
    </Button>
  )
}
