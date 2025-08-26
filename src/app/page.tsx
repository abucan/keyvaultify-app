import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function MarketingPage() {
  if (typeof window === 'undefined') {
    console.log('Rendering on server')
  } else {
    console.log('Rendering on client')
  }

  return (
    <div className="flex h-screen items-center justify-center gap-4">
      <Button asChild>
        <Link href="/auth">Authentication</Link>
      </Button>
      <Button asChild>
        <Link href="/dashboard">Dashboard</Link>
      </Button>
    </div>
  )
}
