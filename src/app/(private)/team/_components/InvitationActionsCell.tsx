// src/app/(private)/team/_components/InvitationActionsCell.tsx
'use client'
import { useTransition } from 'react'
import { CircleX, Mail } from 'lucide-react'

import { cancelInvitationAction } from '@/app/(private)/team/_actions/cancelInvitationAction'
import { resendInvitationAction } from '@/app/(private)/team/_actions/resendInvitationAction'
import { toastRes } from '@/components/toast-result'
import { Button } from '@/components/ui/button'

export function InvitationActionsCell(props: {
  invitationId: string
  email: string
  role: 'member' | 'admin' | 'owner'
  canResend: boolean
  canCancel: boolean
}) {
  const [resending, startResend] = useTransition()
  const [cancelling, startCancel] = useTransition()

  const doResend = () =>
    startResend(async () => {
      const fd = new FormData()
      fd.append('email', props.email)
      fd.append('role', props.role)
      const res = await resendInvitationAction(fd)
      toastRes(res, {
        success: `Invitation resent to ${res.ok && res.data?.email}`,
        errors: {
          NOT_AUTHORIZED: 'Not authorized to resend.',
          UNKNOWN: 'Failed to resend invitation.'
        }
      })
    })

  const doCancel = () =>
    startCancel(async () => {
      const fd = new FormData()
      fd.append('invitationId', props.invitationId)
      const res = await cancelInvitationAction(fd)
      toastRes(res, {
        success: `Invitation cancelled for ${res.ok && res.data?.email}`,
        errors: {
          NOT_AUTHORIZED: 'Not authorized to cancel.',
          UNKNOWN: 'Failed to cancel invitation.'
        }
      })
    })

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        disabled={resending || !props.canResend}
        onClick={doResend}
      >
        <Mail className="size-4" />
        Resend
      </Button>
      <Button
        variant="outline"
        className="border-red-100"
        disabled={cancelling || !props.canCancel}
        onClick={doCancel}
      >
        <CircleX className="size-4 text-red-500" />
        <span className="text-red-500 font-bricolage-grotesque disabled:text-red-100">
          Cancel
        </span>
      </Button>
    </div>
  )
}
