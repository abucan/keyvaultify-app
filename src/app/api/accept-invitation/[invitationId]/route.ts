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
    }) // POST /organization/accept-invitation
  } catch (error) {
    console.error(error)
    // If not signed in or invalid, send to sign-in that redirects back here
    return NextResponse.redirect(
      new URL(
        `/signin?next=/accept-invitation/${invId}`,
        process.env.NEXT_PUBLIC_APP_URL!
      )
    )
  }
  // Optionally set active org now or rely on user to switch
  return NextResponse.redirect(
    new URL('/dashboard', process.env.NEXT_PUBLIC_APP_URL!)
  )
}
