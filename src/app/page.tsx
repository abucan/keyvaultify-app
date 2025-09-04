// src/app/page.tsx
import { headers } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { auth } from '@/lib/better-auth/auth'

export default async function MarketingPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (session?.session?.activeOrganizationId) {
    const orgSlug = await auth.api.getFullOrganization({
      headers: await headers(),
      query: {
        organizationId: session?.session?.activeOrganizationId
      }
    })
    redirect(`/${orgSlug?.slug}`)
  }

  return (
    <div className="flex h-screen items-center justify-center gap-4">
      <Button asChild>
        <Link href="/signin">Authentication</Link>
      </Button>
      <Button asChild>
        <Link href="/bucan">Dashboard</Link>
      </Button>
    </div>
  )
}
