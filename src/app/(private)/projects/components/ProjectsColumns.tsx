// src/app/(private)/projects/components/ProjectsColumns.tsx
'use client'
import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { Key } from 'lucide-react'

import { ProjectRow } from '@/app/(private)/projects/data/projects.queries'
import { Badge } from '@/components/ui/badge'

export const ProjectsColumns: ColumnDef<ProjectRow>[] = [
  {
    accessorKey: 'name',
    header: () => <p className="text-sm font-bricolage-grotesque">Name</p>,
    cell: ({ row }) => {
      return (
        <Link
          href={`/projects/${row.original.id}`}
          className="flex flex-row items-center gap-2.5 hover:underline"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Key className="h-5 w-5 text-primary" />
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
    accessorKey: 'environmentsCount',
    header: () => (
      <p className="text-sm font-bricolage-grotesque">Environments</p>
    ),
    cell: ({ row }) => {
      return (
        <Badge variant="secondary" className="font-bricolage-grotesque">
          {row.original.environmentsCount}
        </Badge>
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
  }
]
