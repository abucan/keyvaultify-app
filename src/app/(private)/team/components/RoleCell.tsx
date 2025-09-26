// src/app/(private)/team/components/RoleCell.tsx
'use client'
import * as React from 'react'
import { useTransition } from 'react'

import { updateMemberRoleAction } from '@/app/(private)/team/actions/updateMemberRoleAction'
import { toastRes } from '@/components/toast-result'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import type { Role } from '@/types/auth'

type RoleCellProps = {
  email: string
  memberId: string
  initialRole: Role
  canEdit: boolean
  isTargetOwner: boolean
  hasOtherOwners: boolean
  canSetOwner: boolean
}

export function RoleCell({
  email,
  memberId,
  initialRole,
  canEdit,
  isTargetOwner,
  hasOtherOwners,
  canSetOwner
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
      toastRes(res, {
        success: res => {
          if (!res.ok) return ''
          return `${email} updated to ${res.data.role.charAt(0).toUpperCase() + res.data.role.slice(1)}.`
        },
        errors: {
          INVALID_INPUT: 'Invalid input.',
          NOT_AUTHORIZED: 'You’re not allowed to change this role.',
          LAST_OWNER_PROTECTED: 'You cannot demote the last owner.'
        }
      })

      if (res.ok) {
        setOptimisticRole(next)
      } else {
        setOptimisticRole(prev)
      }
    })
  }

  // local UI guards (server is still the authority)
  const disableOwnerDemotion = isTargetOwner && !hasOtherOwners
  const disabled = isPending || !canEdit
  console.log(email, isTargetOwner, !isTargetOwner)

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
        <SelectItem
          value="owner"
          disabled={!canEdit || (!canSetOwner && !isTargetOwner)}
        >
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
