'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import {
  cancelInvitationAction,
  resendInvitationAction
} from '@/app/(app)/teams/invitations/actions'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'

export function InvitationActionsCell(props: {
  invitationId: string
  email: string
  role: 'member' | 'admin' | 'owner'
  canResend: boolean
  canCancel: boolean
}) {
  const router = useRouter()
  const [resending, startResend] = useTransition()
  const [cancelling, startCancel] = useTransition()

  const doResend = () =>
    startResend(async () => {
      const fd = new FormData()
      fd.append('email', props.email)
      fd.append('role', props.role)
      const res = await resendInvitationAction(fd)
      if (!res.ok) {
        toast.error(
          res.code === 'NOT_AUTHORIZED'
            ? 'Not authorized to resend.'
            : 'Failed to resend invitation.'
        )
        return
      }
      toast.success('Invitation resent')
      router.refresh()
    })

  const doCancel = () =>
    startCancel(async () => {
      const fd = new FormData()
      fd.append('invitationId', props.invitationId)
      const res = await cancelInvitationAction(fd)
      if (!res.ok) {
        toast.error(
          res.code === 'NOT_AUTHORIZED'
            ? 'Not authorized to cancel.'
            : 'Failed to cancel invitation.'
        )
        return
      }
      toast.success('Invitation cancelled')
      router.refresh()
    })

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="secondary"
        disabled={resending || !props.canResend}
        onClick={doResend}
      >
        Resend
      </Button>

      <ConfirmDialog
        triggerButton={
          <Button
            size="sm"
            variant="outline"
            disabled={cancelling || !props.canCancel}
          >
            Cancel
          </Button>
        }
        title="Cancel Invitation"
        description="Are you sure you want to cancel this invitation?"
        onConfirm={doCancel}
      />
    </div>
  )
}
