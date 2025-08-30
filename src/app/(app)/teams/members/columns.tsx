'use client'

import Image from 'next/image'
import { ColumnDef } from '@tanstack/react-table'
import { CircleX, SquareArrowOutUpLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Member } from '@/types/auth'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'

export const columns: ColumnDef<Member>[] = [
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
      /* owner cannot leave the team and only owner or admin can change the role */
      return (
        <Select
          defaultValue={row.original.role}
          disabled={
            row.original.currentUserRole !== 'owner' &&
            row.original.currentUserRole !== 'admin'
          }
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Role" defaultValue={row.original.role} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="owner">Owner</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="member">Member</SelectItem>
          </SelectContent>
        </Select>
      )
    }
  },
  {
    id: 'actions',
    header: () => <p className="text-sm font-bricolage-grotesque">Actions</p>,
    cell: ({ row }) => {
      return (
        <div className="flex flex-row gap-4">
          <ConfirmDialog
            triggerButton={
              <Button
                variant="outline"
                className="border-red-100"
                disabled={row.original.role === 'owner'}
              >
                <SquareArrowOutUpLeft className="size-4 text-red-500" />
                <span className="text-red-500 font-bricolage-grotesque">
                  Leave
                </span>
              </Button>
            }
            title="Leave Team"
            description="Are you sure you want to leave the team?"
            onConfirm={() => {}}
          />

          {row.original.currentUserRole === 'owner' && (
            <Button variant="outline" className="border-red-100">
              <CircleX className="size-4 text-red-500" />
              <span className="text-red-500 font-bricolage-grotesque">
                Remove
              </span>
            </Button>
          )}
        </div>
      )
    }
  }
]
