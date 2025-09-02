'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CircleX, SquareArrowOutUpLeft } from 'lucide-react'
import { toast } from 'sonner'

import {
  leaveTeamAction,
  removeMemberAction
} from '@/app/(app)/dashboard/[orgSlug]/teams/members/actions'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'

type Props = {
  memberId: string
  canLeave: boolean
  canRemove: boolean
}

export function ActionsCell({ memberId, canLeave, canRemove }: Props) {
  const [leaving, startLeave] = useTransition()
  const [removing, startRemove] = useTransition()
  const router = useRouter()

  const disableLeave = leaving || !canLeave
  const disableRemove = removing || !canRemove

  return (
    <div className="flex flex-row gap-4">
      {/* Leave (self only, owner safety handled on server) */}
      <ConfirmDialog
        triggerButton={
          <Button
            size="icon"
            variant="outline"
            className="border-red-100"
            disabled={disableLeave}
          >
            <SquareArrowOutUpLeft className="size-4 text-red-500" />
          </Button>
        }
        title="Leave Team"
        description="Are you sure you want to leave the team?"
        onConfirm={() =>
          startLeave(async () => {
            const res = await leaveTeamAction()
            if (!res.ok) {
              if (res.code === 'LAST_OWNER_PROTECTED') {
                toast.error(
                  'You are the last owner—add/transfer ownership first.'
                )
              } else if (res.code === 'NOT_AUTHORIZED') {
                toast.error('Not authorized to leave.')
              } else {
                toast.error('Failed to leave team.')
              }
              return
            }
            toast.success('You left the team')
            router.refresh()
          })
        }
      />

      {/* Remove (admin/owner) */}
      <ConfirmDialog
        triggerButton={
          <Button
            size="icon"
            variant="outline"
            className="border-red-100"
            disabled={disableRemove}
          >
            <CircleX className="size-4 text-red-500" />
          </Button>
        }
        title="Remove Member"
        description="Are you sure you want to remove this member?"
        onConfirm={() =>
          startRemove(async () => {
            const fd = new FormData()
            fd.append('memberId', memberId)

            const res = await removeMemberAction(fd)
            if (!res.ok) {
              if (res.code === 'LAST_OWNER_PROTECTED') {
                toast.error('Cannot remove the last owner.')
              } else if (res.code === 'NOT_AUTHORIZED') {
                toast.error('Not authorized to remove this member.')
              } else if (res.code === 'INVALID_INPUT') {
                toast.error('Invalid member.')
              } else {
                toast.error('Failed to remove member.')
              }
              return
            }

            toast.success('Member removed')
            router.refresh()
          })
        }
      />
    </div>
  )
}
