// src/middleware.ts
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  console.log('✅ Middleware running for:', request.nextUrl.pathname)

  const { pathname } = request.nextUrl

  const publicRoutes = ['/', '/signin']
  const isPublicRoute = publicRoutes.some(route => pathname === route)

  try {
    const sessionToken = request.cookies.get('better-auth.session_token')?.value

    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (sessionToken && pathname === '/signin') {
      console.log('✅ User already authenticated, redirecting to dashboard')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // If it's a public route (and not /auth with session), allow access
    if (isPublicRoute) {
      console.log('✅ Public route')
      return NextResponse.next()
    }

    // For protected routes, check authentication
    if (!sessionToken) {
      console.log('❌ No session token, redirecting to /signin')
      return NextResponse.redirect(new URL('/signin', request.url))
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
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|txt|xml|woff2?|woff|ttf|otf|eot)).*)'
  ]
}
