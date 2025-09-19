// src/app/accept-invitation/[invitationId]/route.ts
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

import { auth } from '@/lib/better-auth/auth'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ invitationId: string }> }
) {
  const { invitationId: invId } = await params

  try {
    await auth.api.acceptInvitation({
      headers: await headers(),
      body: { invitationId: invId }
    })

    const res = NextResponse.redirect(new URL('/dashboard', _req.url))
    res.cookies.set('kvf_toast', 'INVITE_ACCEPTED', {
      maxAge: 10,
      path: '/',
      sameSite: 'lax',
      secure: true,
      httpOnly: false
    })

    return res
  } catch {
    console.log('Error accepting invitation')
    return NextResponse.redirect(
      new URL(
        `/signin?next=/accept-invitation/${invId}`,
        process.env.NEXT_PUBLIC_APP_URL!
      )
    )
  }
}
