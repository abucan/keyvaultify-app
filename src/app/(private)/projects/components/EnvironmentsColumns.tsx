// src/app/(private)/projects/components/EnvironmentsColumns.tsx
import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { Folder } from 'lucide-react'

import { EnvironmentRow } from '@/app/(private)/projects/data/projects.queries'
import { EnvironmentActionsCell } from '@/app/(private)/projects/components/EnvironmentActionsCell'
import { Badge } from '@/components/ui/badge'

export const createEnvironmentsColumns = (
  projectId: string
): ColumnDef<EnvironmentRow>[] => [
  {
    accessorKey: 'name',
    header: () => <p className="text-sm font-bricolage-grotesque">Name</p>,
    cell: ({ row }) => {
      return (
        <Link
          href={`/projects/${projectId}/environments/${row.original.id}`}
          className="flex flex-row items-center gap-2.5 hover:underline"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/50">
            <Folder className="h-5 w-5 text-secondary-foreground" />
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-bricolage-grotesque font-[500]">
              {row.original.name}
            </p>
            {row.original.description && (
              <p className="text-sm text-muted-foreground font-bricolage-grotesque line-clamp-1">
                {row.original.description}
              </p>
            )}
          </div>
        </Link>
      )
    }
  },
  {
    accessorKey: 'secretsCount',
    header: () => <p className="text-sm font-bricolage-grotesque">Secrets</p>,
    cell: ({ row }) => {
      return (
        <Badge variant="outline" className="font-bricolage-grotesque">
          {row.original.secretsCount}
        </Badge>
      )
    }
  },
  {
    accessorKey: 'createdAt',
    header: () => <p className="text-sm font-bricolage-grotesque">Created</p>,
    cell: ({ row }) => {
      const date = row.original.createdAt
      let formatted = '-'

      if (date) {
        try {
          // Handle both Date objects and timestamp numbers
          const dateObj = date instanceof Date ? date : new Date(date)
          formatted = dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })
        } catch {
          formatted = '-'
        }
      }

      return (
        <p className="text-sm font-[400] text-muted-foreground font-bricolage-grotesque">
          {formatted}
        </p>
      )
    }
  },
  {
    id: 'actions',
    header: () => <p className="text-sm font-bricolage-grotesque">Actions</p>,
    cell: ({ row }) => {
      const env = row.original
      return (
        <EnvironmentActionsCell
          envId={env.id}
          envName={env.name}
          envDescription={env.description}
          projectId={projectId}
          canEdit={env._acl.canEdit}
          canDelete={env._acl.canDelete}
        />
      )
    }
  }
]
