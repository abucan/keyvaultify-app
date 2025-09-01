'use client'

import Image from 'next/image'
import { ColumnDef } from '@tanstack/react-table'
import { CircleX, Copy, Send, SquareArrowOutUpLeft } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
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
import { InviteRow, InviteStatus } from '@/types/auth'

const STATUS_STYLES: Record<
  InviteStatus,
  { label: string; className: string }
> = {
  accepted: {
    label: 'Accepted',
    className:
      'bg-emerald-100 text-emerald-700 border-transparent dark:bg-emerald-950/40 dark:text-emerald-300 py-1'
  },
  pending: {
    label: 'Pending',
    className:
      'bg-amber-100 text-amber-800 border-transparent dark:bg-amber-950/40 dark:text-amber-300 py-1'
  },
  canceled: {
    label: 'Canceled',
    className:
      'bg-slate-200 text-slate-700 border-transparent dark:bg-slate-800 dark:text-slate-300 py-1'
  },
  rejected: {
    label: 'Rejected',
    className:
      'bg-red-100 text-red-700 border-transparent dark:bg-red-950/40 dark:text-red-300 py-1'
  }
}

export const columns: ColumnDef<InviteRow>[] = [
  {
    accessorKey: 'email',
    header: () => <p className="text-sm font-bricolage-grotesque ml-2">Name</p>,
    cell: ({ row }) => {
      return (
        <p className="text-sm font-bricolage-grotesque font-[500] ml-2">
          {row.original.email}
        </p>
      )
    }
  },
  {
    accessorKey: 'expiresAt',
    header: () => (
      <p className="text-sm font-bricolage-grotesque">Expires At</p>
    ),
    cell: ({ row }) => {
      return (
        <p className="text-sm font-[400] text-muted-foreground font-bricolage-grotesque">
          {row.original.expiresAt}
        </p>
      )
    }
  },
  {
    accessorKey: 'status',
    header: () => <p className="text-sm font-bricolage-grotesque">Status</p>,
    cell: ({ row }) => {
      const stats = STATUS_STYLES[row.original.status]
      return <Badge className={stats.className}>{stats.label}</Badge>
    }
  },
  {
    id: 'actions',
    header: () => <p className="text-sm font-bricolage-grotesque">Actions</p>,
    cell: ({ row }) => {
      return (
        <div className="flex flex-row gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size={'icon'}
                variant="outline"
                className="border-red-100"
                disabled={row.original.role === 'owner'}
              >
                <Send className="size-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Resend</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size={'icon'}
                variant="outline"
                className="border-red-100"
                disabled={row.original.role === 'owner'}
              >
                <Copy className="size-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size={'icon'}
                variant="outline"
                className="border-red-100"
                disabled={row.original.role === 'owner'}
              >
                <CircleX className="size-4 text-red-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Cancel</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )
    }
  }
]
