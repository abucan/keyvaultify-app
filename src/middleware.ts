// src/middleware.ts
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { betterFetch } from '@better-fetch/fetch'

import { auth } from '@/lib/better-auth/auth'

type Session = typeof auth.$Infer.Session

export async function middleware(request: NextRequest) {
  console.log('✅ Middleware running for:', request.nextUrl.pathname)

  const { pathname, search } = request.nextUrl

  const PUBLIC_ROUTE_PREFIXES = ['/accept-invitation']
  const PUBLIC_ROUTES = ['/', '/signin']

  const isPublicRoute =
    PUBLIC_ROUTES.includes(pathname) ||
    PUBLIC_ROUTE_PREFIXES.some(prefix => pathname.startsWith(prefix))

  try {
    const { data: session } = await betterFetch<Session>(
      '/api/auth/get-session',
      {
        baseURL: request.nextUrl.origin,
        headers: {
          cookie: request.headers.get('cookie') ?? ''
        }
      }
    )

    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (session?.session && session?.user && pathname === '/signin') {
      console.log('✅ User already authenticated, redirecting to dashboard')
      const params = new URLSearchParams(search)
      const next = params.get('next') || '/dashboard'
      return NextResponse.redirect(new URL(next, request.url))
    }

    // If it's a public route (and not /auth with session), allow access
    if (isPublicRoute) {
      console.log('✅ Public route')
      return NextResponse.next()
    }

    // For protected routes, check authentication
    if (!session) {
      console.log('❌ No session token, redirecting to /signin')
      const signIn = new URL('/signin', request.url)
      signIn.searchParams.set('next', pathname + search)
      return NextResponse.redirect(signIn)
    }

    console.log('✅ Session token found, allowing access to protected route')
    return NextResponse.next()
  } catch (error) {
    console.error('Middleware auth error:', error)
    return NextResponse.redirect(new URL('/signin', request.url))
  }
}

export const config = {
  // matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)']
  /*   matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|txt|xml|woff2?|woff|ttf|otf|eot)).*)'
  ] */
  matcher: ['/((?!_next|api|.*\\..*).*)']
}
