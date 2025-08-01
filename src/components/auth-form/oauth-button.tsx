import { ChevronRight } from 'lucide-react'
import { Button } from '../ui/button'
import Image from 'next/image'
import { createAuthClient } from 'better-auth/client'

type OAuthButtonProps = {
  provider: 'google' | 'github'
  text: string
  icon: string
}

export const OAuthButton = ({ provider, text, icon }: OAuthButtonProps) => {
  const auth = createAuthClient()

  const handleGithubSignIn = async () => {
    try {
      await auth.signIn.social({
        provider: 'github'
      })
    } catch (error) {
      console.error('Error signing in with GitHub:', error)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await auth.signIn.social({
        provider: 'google'
      })
    } catch (error) {
      console.error('Error signing in with Google:', error)
    }
  }

  return (
    <Button
      className="justify-between rounded-full font-roboto-mono"
      size={'lg'}
      variant={'outline'}
      type="button"
      onClick={provider === 'github' ? handleGithubSignIn : handleGoogleSignIn}
    >
      <Image src={`/icons/${icon}.svg`} alt={provider} width={16} height={16} />
      {text}
      <ChevronRight className="text-muted-foreground" />
    </Button>
  )
}
