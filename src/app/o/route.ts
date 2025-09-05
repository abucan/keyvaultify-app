/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/o/route.ts
import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/lib/better-auth/auth'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const to = url.searchParams.get('to') || '/'
  try {
    // Now the cookie is present; protected calls are allowed.
    const full = await auth.api.getFullOrganization({ headers: req.headers })
    const slug = (full as any)?.slug ?? (full as any)?.organization?.slug ?? ''

    if (slug) {
      // if `to` is '/path', go to '/[slug]/path' else just '/[slug]'
      const dest = to.startsWith('/') ? `/${slug}${to}` : `/${slug}`
      return NextResponse.redirect(new URL(dest, url))
    }

    // No team? Send to onboarding/new-team flow.
    return NextResponse.redirect(new URL('/teams/new', url))
  } catch {
    // If anything goes wrong, route to a safe place (e.g. dashboard/onboarding)
    return NextResponse.redirect(new URL('/teams/new', url))
  }
}
