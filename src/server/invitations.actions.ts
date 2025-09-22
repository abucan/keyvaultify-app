// src/server/invitations.actions.ts
'use server'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

import { auth } from '@/lib/better-auth/auth'
import { mapError } from '@/lib/errors/mapError'
import { InvitationRow } from '@/types/auth'
import { R } from '@/types/result'

export async function listTeamInvitations(): Promise<R<InvitationRow[]>> {
  try {
    const _headers = await headers()

    const [full, session, invitesRes] = await Promise.all([
      auth.api.getFullOrganization({ headers: _headers }), // for role gating
      auth.api.getSession({ headers: _headers }),
      auth.api.listInvitations({ headers: _headers }) // for rows
    ])

    const currentUserId = session?.session?.userId ?? null
    const members = full?.members ?? []
    const me = members.find((m: any) => m.userId === currentUserId)
    const myRole = (me?.role as 'member' | 'admin' | 'owner') ?? 'member'

    const canManage = myRole === 'owner' || myRole === 'admin'

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    const rows = {
      ok: true,
      data: (invitesRes ?? []).map((inv: any) => {
        const acceptUrl = `${baseUrl}/accept-invitation/${inv.id}`

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
    }

    return { ok: true, data: rows.data }
  } catch (e: any) {
    const { code, message } = mapError(e)
    return { ok: false, code, message }
  }
}

export async function resendInvitationAction(
  fd: FormData
): Promise<R<{ email: string }>> {
  const input = {
    email: String(fd.get('email') ?? '').trim(),
    role: String(fd.get('role') ?? 'member') as 'member' | 'admin' | 'owner'
  }
  if (!input.email || !input.role) return { ok: false, code: 'INVALID_INPUT' }

  try {
    await auth.api.createInvitation({
      headers: await headers(),
      body: { email: input.email, role: input.role, resend: true }
    })
    revalidatePath('/team/invitations')
    return { ok: true, data: { email: input.email } }
  } catch (e: any) {
    const { code, message } = mapError(e)
    return { ok: false, code, message }
  }
}

export async function cancelInvitationAction(
  fd: FormData
): Promise<R<{ email: string }>> {
  const invitationId = String(fd.get('invitationId') ?? '')
  if (!invitationId) return { ok: false, code: 'INVALID_INPUT' }

  try {
    const res = await auth.api.cancelInvitation({
      headers: await headers(),
      body: { invitationId }
    })
    revalidatePath('/team/invitations')
    return { ok: true, data: { email: res?.email ?? '' } }
  } catch (e: any) {
    const { code, message } = mapError(e)
    return { ok: false, code, message }
  }
}
