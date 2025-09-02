// GET /o/:slug/*

import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

import { auth } from '@/lib/better-auth/auth'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string; rest?: string[] }> }
) {
  const { slug, rest } = await params
  const url = new URL(req.url)
  const to = '/' + (rest?.join('/') || 'dashboard')

  try {
    await auth.api.setActiveOrganization({
      headers: await headers(),
      body: { organizationSlug: slug }
    })
  } catch {
    return NextResponse.redirect(new URL('/not-found', url))
  }

  return NextResponse.redirect(new URL(to, url))
}
