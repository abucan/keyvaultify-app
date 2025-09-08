// src/app/page.tsx
import { headers } from 'next/headers'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { auth } from '@/lib/better-auth/auth'

export default async function MarketingPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  return (
    <div className="flex h-screen items-center justify-center gap-4">
      <Button asChild>
        <Link href="/signin">Authentication</Link>
      </Button>
      {session?.session?.activeOrganizationId && (
        <Button asChild>
          <Link href={`/dashboard`}>Dashboard</Link>
        </Button>
      )}
    </div>
  )
}
