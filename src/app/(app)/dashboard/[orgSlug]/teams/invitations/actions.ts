/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

import { auth } from '@/lib/better-auth/auth'
import { InvitationRow } from '@/types/auth'

export type ActionResult =
  | { ok: true }
  | { ok: false; code: 'NOT_AUTHORIZED' | 'INVALID_INPUT' | 'UNKNOWN' }

async function bindOrg(slug: string) {
  await auth.api.setActiveOrganization({
    headers: await headers(),
    body: { organizationSlug: slug }
  })
}

export async function listTeamInvitations(
  orgSlug: string
): Promise<InvitationRow[]> {
  await bindOrg(orgSlug)
  const hdrs = await headers()

  const [full, session, invitesRes] = await Promise.all([
    auth.api.getFullOrganization({ headers: hdrs }), // for role gating
    auth.api.getSession({ headers: hdrs }),
    auth.api.listInvitations({ headers: hdrs }) // for rows
  ])

  const currentUserId = session?.session?.userId ?? null
  const members = full?.members ?? []
  const me = members.find((m: any) => m.userId === currentUserId)
  const myRole = (me?.role as 'member' | 'admin' | 'owner') ?? 'member'

  const canManage = myRole === 'owner' || myRole === 'admin'

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ''
  const rows = (invitesRes ?? []).map((inv: any) => {
    const acceptUrl = `${baseUrl}/api/accept-invitation/${inv.id}`

    return {
      id: inv.id,
      email: inv.email,
      role: (inv.role ?? 'member') as 'member' | 'admin' | 'owner',
      expiresAt: new Date(inv.expiresAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      status: inv.status ?? 'pending',
      acceptUrl,
      _acl: {
        canResend: canManage && inv.status === 'pending',
        canCancel: canManage && inv.status === 'pending',
        canCopy: inv.status === 'pending'
      }
    } satisfies InvitationRow
  })

  return rows
}

export async function resendInvitationAction(
  orgSlug: string,
  fd: FormData
): Promise<ActionResult> {
  await bindOrg(orgSlug)
  const email = String(fd.get('email') ?? '').trim()
  const role = String(fd.get('role') ?? 'member') as
    | 'member'
    | 'admin'
    | 'owner'
  if (!email) return { ok: false, code: 'INVALID_INPUT' }

  try {
    // BetterAuth supports resending by passing `resend: true`
    await auth.api.createInvitation({
      headers: await headers(),
      body: { email, role, resend: true }
    })
    revalidatePath('/teams/invitations')
    return { ok: true }
  } catch (e: any) {
    if (e?.message === 'NOT_AUTHORIZED')
      return { ok: false, code: 'NOT_AUTHORIZED' }
    return { ok: false, code: 'UNKNOWN' }
  }
}

export async function cancelInvitationAction(
  orgSlug: string,
  fd: FormData
): Promise<ActionResult> {
  await bindOrg(orgSlug)
  const invitationId = String(fd.get('invitationId') ?? '')
  if (!invitationId) return { ok: false, code: 'INVALID_INPUT' }

  try {
    await auth.api.cancelInvitation({
      headers: await headers(),
      body: { invitationId }
    })
    revalidatePath('/teams/invitations')
    return { ok: true }
  } catch (e: any) {
    if (e?.message === 'NOT_AUTHORIZED')
      return { ok: false, code: 'NOT_AUTHORIZED' }
    return { ok: false, code: 'UNKNOWN' }
  }
}
