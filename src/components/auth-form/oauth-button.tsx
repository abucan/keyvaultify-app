import { ChevronRight } from 'lucide-react'
import { Button } from '../ui/button'
import Image from 'next/image'

type OAuthButtonProps = {
  provider: 'google' | 'github'
  text: string
  icon: string
  onClick: () => void
}

export const OAuthButton = ({
  provider,
  text,
  icon,
  onClick
}: OAuthButtonProps) => {
  return (
    <Button
      className="justify-between rounded-full font-roboto-mono"
      size={'lg'}
      variant={'outline'}
      onClick={onClick}
    >
      <Image src={`/icons/${icon}.svg`} alt={provider} width={16} height={16} />
      {text}
      <ChevronRight className="text-muted-foreground" />
    </Button>
  )
}
