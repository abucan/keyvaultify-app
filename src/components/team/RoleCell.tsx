// src/components/team/RoleCell.tsx
'use client'
import * as React from 'react'
import { useTransition } from 'react'
import { toast } from 'sonner'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { updateMemberRoleAction } from '@/server/members.actions'
import type { Role } from '@/types/auth'

type RoleCellProps = {
  memberId: string
  initialRole: Role
  canEdit: boolean
  isTargetOwner: boolean
  hasOtherOwners: boolean
}

export function RoleCell({
  memberId,
  initialRole,
  canEdit,
  isTargetOwner,
  hasOtherOwners
}: RoleCellProps) {
  const [optimisticRole, setOptimisticRole] = React.useState<Role>(initialRole)
  const [isPending, startTransition] = useTransition()

  async function commit(next: Role) {
    const prev = optimisticRole
    setOptimisticRole(next) // optimistic apply

    const fd = new FormData()
    fd.append('memberId', memberId)
    fd.append('role', next)

    startTransition(async () => {
      const res = await updateMemberRoleAction(fd)
      if (!res.ok) {
        // revert optimistic UI
        setOptimisticRole(prev)

        if (res.code === 'LAST_OWNER_PROTECTED') {
          toast.error('You cannot demote the last owner.')
        } else if (res.code === 'NOT_AUTHORIZED') {
          toast.error('You’re not allowed to change this role.')
        } else if (res.code === 'INVALID_INPUT') {
          toast.error('Invalid input.')
        } else {
          toast.error('Something went wrong.')
        }
      } else {
        toast.success('Role updated')
      }
    })
  }

  // local UI guards (server is still the authority)
  const disableOwnerDemotion = isTargetOwner && !hasOtherOwners
  const disabled = isPending || !canEdit

  return (
    <Select
      value={optimisticRole}
      onValueChange={val => commit(val as Role)}
      disabled={disabled}
    >
      <SelectTrigger className="w-[120px]">
        <SelectValue placeholder="Role" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="owner" disabled={!canEdit}>
          Owner
        </SelectItem>
        <SelectItem
          value="admin"
          disabled={
            !canEdit || (disableOwnerDemotion && optimisticRole === 'owner')
          }
        >
          Admin
        </SelectItem>
        <SelectItem
          value="member"
          disabled={
            !canEdit || (disableOwnerDemotion && optimisticRole === 'owner')
          }
        >
          Member
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
