// src/components/auth-form/OAuthButton.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
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
  const sp = useSearchParams()
  const [pending, setPending] = useState(false)

  const next = useMemo(() => {
    const raw = sp.get('next') ?? '/dashboard'
    const ok = raw.startsWith('/') && !raw.startsWith('//')
    return ok ? raw : '/dashboard'
  }, [sp])

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const callbackURL = origin ? new URL(next, origin).toString() : next
  const newUserCallbackURL = origin
    ? new URL('/dashboard', origin).toString()
    : '/dashboard'

  function useLocalStorage(key: string) {
    const [value, setValue] = useState<string | null>(null)
    useEffect(() => {
      setValue(localStorage.getItem(key))
    }, [key])
    return value
  }
  const lastUsedProvider = useLocalStorage('lastUsedProvider')

  const handleOAuthSignIn = async () => {
    try {
      setPending(true)
      await auth.signIn.social({
        provider,
        callbackURL,
        newUserCallbackURL
      })
      handleLastUsed(provider)
    } catch (err) {
      console.error('OAuth error:', err)
      setPending(false)
    }
  }

  return (
    <Button
      className="justify-between rounded-full font-bricolage-grotesque relative"
      size="lg"
      variant="outline"
      type="button"
      onClick={handleOAuthSignIn}
      disabled={pending}
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
