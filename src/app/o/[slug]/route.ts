// GET /o/:slug?to=

import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

import { auth } from '@/lib/better-auth/auth'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const url = new URL(request.url)
  const to = url.searchParams.get('to') || '/dashboard'

  try {
    await auth.api.setActiveOrganization({
      headers: await headers(),
      body: {
        organizationSlug: params.slug
      }
    })
  } catch {
    return NextResponse.redirect(new URL('/not-found', to))
  }

  return NextResponse.redirect(new URL(to, url))
}
