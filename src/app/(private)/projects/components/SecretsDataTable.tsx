// src/app/(private)/projects/components/SecretsDataTable.tsx
'use client'
import React, { useState } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import { Plus, Download, Copy } from 'lucide-react'

import {
  SecretRow,
  EnvironmentRow
} from '@/app/(private)/projects/data/projects.queries'
import { createSecretsColumns } from '@/app/(private)/projects/components/SecretsColumns'
import { AddSecretForm } from '@/app/(private)/projects/components/AddSecretForm'
import { BulkAddSecretForm } from '@/app/(private)/projects/components/BulkAddSecretForm'
import { AddDialog } from '@/components/shared/AddDialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

interface DataTableProps {
  data: SecretRow[]
  environmentId: string
  projectId: string
  environments: EnvironmentRow[]
}

export function SecretsDataTable({
  data,
  environmentId,
  projectId,
  environments
}: DataTableProps) {
  const columns = React.useMemo(
    () => createSecretsColumns(environmentId, projectId),
    [environmentId, projectId]
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  const [addSecretDialogOpen, setAddSecretDialogOpen] = useState(false)
  const [bulkAddSecretDialogOpen, setBulkAddSecretDialogOpen] = useState(false)

  const handleExportEnv = () => {
    const envContent = data
      .map(secret => `${secret.key}=${secret.value}`)
      .join('\n')

    const blob = new Blob([envContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${environments.find(e => e.id === environmentId)?.name.toLowerCase() || 'secrets'}.env`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopyAll = async () => {
    const envContent = data
      .map(secret => `${secret.key}=${secret.value}`)
      .join('\n')

    await navigator.clipboard.writeText(envContent)
    // You could add a toast notification here
  }

  return (
    <>
      <AddDialog
        open={addSecretDialogOpen}
        onOpenChange={setAddSecretDialogOpen}
        title="Add secret"
        description="Add a new environment variable to this environment."
      >
        <AddSecretForm
          environmentId={environmentId}
          projectId={projectId}
          environments={environments.map(e => ({ id: e.id, name: e.name }))}
          setAddSecretDialogOpen={setAddSecretDialogOpen}
        />
      </AddDialog>

      <AddDialog
        open={bulkAddSecretDialogOpen}
        onOpenChange={setBulkAddSecretDialogOpen}
        title="Bulk add secrets"
        description="Paste multiple environment variables at once."
      >
        <BulkAddSecretForm
          environmentId={environmentId}
          projectId={projectId}
          setBulkAddSecretDialogOpen={setBulkAddSecretDialogOpen}
        />
      </AddDialog>

      <div className="flex flex-col gap-4 w-3/4 lg:w-full">
        <div className="flex gap-2 self-end flex-wrap">
          <Button
            type="button"
            variant="outline"
            onClick={() => setAddSecretDialogOpen(true)}
          >
            <Plus className="size-4" />
            <span className="font-bricolage-grotesque">Add Secret</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setBulkAddSecretDialogOpen(true)}
          >
            <Plus className="size-4" />
            <span className="font-bricolage-grotesque">Bulk Add</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleExportEnv}
            disabled={data.length === 0}
          >
            <Download className="size-4" />
            <span className="font-bricolage-grotesque">Export .env</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCopyAll}
            disabled={data.length === 0}
          >
            <Copy className="size-4" />
            <span className="font-bricolage-grotesque">Copy All</span>
          </Button>
        </div>

        <Card className="overflow-hidden rounded-md border p-0 m-0 w-full">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="text-sm text-muted-foreground font-bricolage-grotesque">
                        No secrets yet.
                      </p>
                      <p className="text-xs text-muted-foreground font-bricolage-grotesque">
                        Add your first environment variable.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </>
  )
}
