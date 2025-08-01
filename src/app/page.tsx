import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
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
