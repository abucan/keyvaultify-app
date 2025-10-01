// src/app/(private)/settings/developer/components/ApiTokensColumns.tsx
'use client'
import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { AlertTriangle, Check, Clock, Copy } from 'lucide-react'

import { ApiTokenRow } from '@/app/(private)/settings/developer/data/tokens.queries'
import { ApiTokenActionsCell } from '@/app/(private)/settings/developer/components/ApiTokenActionsCell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const ApiTokensColumns: ColumnDef<ApiTokenRow>[] = [
  {
    accessorKey: 'name',
    header: () => <p className="text-sm font-bricolage-grotesque">Name</p>,
    cell: ({ row }) => {
      const [copied, setCopied] = useState(false)
      const tokenPrefix = row.original.tokenPrefix

      const handleCopy = async () => {
        await navigator.clipboard.writeText(tokenPrefix)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }

      return (
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <p className="text-sm font-bricolage-grotesque font-[500]">
              {row.original.name}
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              {tokenPrefix}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      )
    }
  },
  {
    accessorKey: 'projectName',
    header: () => <p className="text-sm font-bricolage-grotesque">Scope</p>,
    cell: ({ row }) => {
      const projectName = row.original.projectName
      return (
        <Badge
          variant={projectName ? 'secondary' : 'outline'}
          className="font-bricolage-grotesque"
        >
          {projectName || 'All Projects'}
        </Badge>
      )
    }
  },
  {
    accessorKey: 'lastUsed',
    header: () => <p className="text-sm font-bricolage-grotesque">Last Used</p>,
    cell: ({ row }) => {
      const date = row.original.lastUsed
      const formatted = date
        ? new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })
        : 'Never'

      return (
        <p className="text-sm font-[400] text-muted-foreground font-bricolage-grotesque">
          {formatted}
        </p>
      )
    }
  },
  {
    accessorKey: 'expiresAt',
    header: () => <p className="text-sm font-bricolage-grotesque">Expires</p>,
    cell: ({ row }) => {
      const date = row.original.expiresAt
      const isExpired = row.original.isExpired

      if (!date) {
        return (
          <Badge variant="outline" className="font-bricolage-grotesque">
            Never
          </Badge>
        )
      }

      const formatted = new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })

      if (isExpired) {
        return (
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive font-bricolage-grotesque">
              Expired
            </span>
          </div>
        )
      }

      return (
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground font-bricolage-grotesque">
            {formatted}
          </span>
        </div>
      )
    }
  },
  {
    id: 'actions',
    header: () => <p className="text-sm font-bricolage-grotesque">Actions</p>,
    cell: ({ row }) => {
      const token = row.original
      return (
        <ApiTokenActionsCell
          tokenId={token.id}
          tokenName={token.name}
          canRevoke={token._acl.canRevoke}
        />
      )
    }
  }
]
