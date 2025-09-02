'use client'

import { useTransition } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { CircleX, SquareArrowOutUpLeft } from 'lucide-react'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ActionsCell } from '@/components/team/ActionsCell'
import { RoleCell } from '@/components/team/RoleCell'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { Member, MemberRow, Role } from '@/types/auth'

import { updateMemberRoleAction } from './actions'

export const columns: ColumnDef<MemberRow>[] = [
  {
    accessorKey: 'image',
    header: () => <p className="text-sm font-bricolage-grotesque">Name</p>,
    cell: ({ row }) => {
      return (
        <div className="flex flex-row items-center gap-2.5">
          <Image
            src={row.original.image}
            alt={row.original.name}
            width={40}
            height={40}
            className="rounded-full"
          />
          <div className="flex flex-col">
            <p className="text-sm font-bricolage-grotesque font-[500]">
              {row.original.name}
            </p>
            <p className="text-sm text-muted-foreground font-bricolage-grotesque">
              {row.original.email}
            </p>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: 'name',
    header: () => null,
    cell: ({}) => {
      return null
    }
  },
  {
    accessorKey: 'email',
    header: () => null,
    cell: ({}) => {
      return null
    }
  },
  {
    accessorKey: 'joinedAt',
    header: () => <p className="text-sm font-bricolage-grotesque">Joined At</p>,
    cell: ({ row }) => {
      return (
        <p className="text-sm font-[400] text-muted-foreground font-bricolage-grotesque">
          {row.original.joinedAt}
        </p>
      )
    }
  },
  {
    accessorKey: 'role',
    header: () => <p className="text-sm font-bricolage-grotesque">Role</p>,
    cell: ({ row }) => {
      const m = row.original
      const canEdit = m._acl?.canEditRole === true
      const isTargetOwner = m.role === 'owner'
      const hasOtherOwners = m._meta?.hasOtherOwners === true

      return (
        <RoleCell
          memberId={m.id}
          initialRole={m.role as Role}
          canEdit={canEdit}
          isTargetOwner={isTargetOwner}
          hasOtherOwners={hasOtherOwners}
        />
      )
    }
  },
  {
    id: 'actions',
    header: () => <p className="text-sm font-bricolage-grotesque">Actions</p>,
    cell: ({ row }) => {
      const m = row.original
      const canLeave = m._acl?.canLeave === true
      const canRemove = m._acl?.canRemove === true

      return (
        <ActionsCell
          memberId={m.id}
          canLeave={canLeave}
          canRemove={canRemove}
        />
      )
    }
  }
]
