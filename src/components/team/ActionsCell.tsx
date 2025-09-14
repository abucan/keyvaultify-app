// src/components/team/ActionsCell.tsx
'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CircleX, SquareArrowOutUpLeft } from 'lucide-react'

import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { leaveTeamAction, removeMemberAction } from '@/server/members.actions'
import { toastRes } from '../toast-result'

export function ActionsCell({
  email,
  memberId,
  canLeave,
  canRemove
}: {
  email: string
  memberId: string
  canLeave: boolean
  canRemove: boolean
}) {
  const [leaving, startLeave] = useTransition()
  const [removing, startRemove] = useTransition()
  const router = useRouter()

  const disableLeave = leaving || !canLeave
  const disableRemove = removing || !canRemove

  const [openLeaveDialog, setOpenLeaveDialog] = useState(false)
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false)

  return (
    <div className="flex flex-row gap-4">
      {/* Leave (self only, owner safety handled on server) */}
      <ConfirmDialog
        open={openLeaveDialog}
        onOpenChange={setOpenLeaveDialog}
        title="Leave"
        description="Are you sure you want to leave the team?"
        isDisabled={disableLeave}
        icon={<SquareArrowOutUpLeft className="size-4 text-red-500" />}
        confirmText="LEAVE"
        action={() => {
          startLeave(async () => {
            const res = await leaveTeamAction()
            toastRes(res, {
              success: 'You left the team.',
              errors: {
                LAST_OWNER_PROTECTED:
                  'You are the last owner—add/transfer ownership first.',
                NOT_AUTHORIZED: 'Not authorized to leave.',
                UNKNOWN: 'Failed to leave team.'
              }
            })
          })
        }}
      />

      {/* Remove (admin/owner) */}
      <ConfirmDialog
        open={openRemoveDialog}
        onOpenChange={setOpenRemoveDialog}
        title="Remove"
        description="Are you sure you want to remove this member?"
        isDisabled={disableRemove}
        icon={<CircleX className="size-4 text-red-500" />}
        confirmText="REMOVE"
        action={() => {
          startRemove(async () => {
            const fd = new FormData()
            fd.append('memberId', memberId || email)

            const res = await removeMemberAction(fd)
            toastRes(res, {
              success: `${email} removed from the team.`,
              errors: {
                LAST_OWNER_PROTECTED: 'Cannot remove the last owner.',
                NOT_AUTHORIZED: 'Not authorized to remove this member.',
                INVALID_INPUT: 'Invalid member.',
                UNKNOWN: 'Failed to remove member.'
              }
            })
          })
        }}
      />
    </div>
  )
}
