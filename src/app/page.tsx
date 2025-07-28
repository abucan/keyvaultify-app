import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex h-screen items-center justify-center gap-4">
      <Button asChild>
        <Link href="/auth/signin">Sign In</Link>
      </Button>
      <Button asChild>
        <Link href="/auth/signup">Sign Up</Link>
      </Button>
    </div>
  )
}
