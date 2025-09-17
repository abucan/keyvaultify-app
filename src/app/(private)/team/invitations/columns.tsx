// src/app/(private)/team/invitations/columns.tsx
'use client'
import { ColumnDef } from '@tanstack/react-table'

import { CopyLinkCell } from '@/components/shared/CopyLinkCell'
import { InvitationActionsCell } from '@/components/team/InvitationActionsCell'
import { Badge } from '@/components/ui/badge'
import { InvitationRow, InviteStatus } from '@/types/auth'

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

export const columns: ColumnDef<InvitationRow>[] = [
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
      const stats = STATUS_STYLES[row.original.status as InviteStatus]
      return <Badge className={stats.className}>{stats.label}</Badge>
    }
  },
  {
    id: 'actions',
    header: () => <p className="text-sm font-bricolage-grotesque">Actions</p>,
    cell: ({ row }) => {
      const r = row.original
      return (
        <div className="flex flex-row items-center justify-between">
          <CopyLinkCell
            url={row.original.acceptUrl}
            canCopy={row.original._acl.canCopy}
          />
          <InvitationActionsCell
            invitationId={r.id}
            email={r.email}
            role={r.role}
            canResend={r._acl.canResend}
            canCancel={r._acl.canCancel}
          />
        </div>
      )
    }
  }
]
