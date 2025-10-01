// src/app/(private)/projects/components/SecretsColumns.tsx
'use client'
import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Check, Copy, Eye, EyeOff } from 'lucide-react'

import { SecretRow } from '@/app/(private)/projects/data/projects.queries'
import { SecretActionsCell } from '@/app/(private)/projects/components/SecretActionsCell'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const createSecretsColumns = (
  environmentId: string,
  projectId: string
): ColumnDef<SecretRow>[] => [
  {
    accessorKey: 'key',
    header: () => <p className="text-sm font-bricolage-grotesque">Key</p>,
    cell: ({ row }) => {
      const [keyCopied, setKeyCopied] = useState(false)
      const key = row.original.key

      const handleCopyKey = async () => {
        await navigator.clipboard.writeText(key)
        setKeyCopied(true)
        setTimeout(() => setKeyCopied(false), 2000)
      }

      return (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono text-xs">
            {row.original.key}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleCopyKey}
          >
            {keyCopied ? (
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
    accessorKey: 'value',
    header: () => <p className="text-sm font-bricolage-grotesque">Value</p>,
    cell: ({ row }) => {
      const [isVisible, setIsVisible] = useState(false)
      const [copied, setCopied] = useState(false)
      const key = row.original.key
      const value = row.original.value

      const handleCopy = async () => {
        // Copy in KEY=VALUE format
        await navigator.clipboard.writeText(`${key}=${value}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }

      return (
        <div className="flex items-center gap-2">
          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs">
            {isVisible ? value : '•'.repeat(Math.min(value.length, 20))}
          </code>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsVisible(!isVisible)}
            >
              {isVisible ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
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
        </div>
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
    accessorKey: 'updatedAt',
    header: () => <p className="text-sm font-bricolage-grotesque">Updated</p>,
    cell: ({ row }) => {
      const date = row.original.updatedAt
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
      const secret = row.original
      return (
        <SecretActionsCell
          secretId={secret.id}
          secretKey={secret.key}
          secretValue={secret.value}
          environmentId={environmentId}
          projectId={projectId}
          canEdit={secret._acl.canEdit}
          canDelete={secret._acl.canDelete}
        />
      )
    }
  }
]
