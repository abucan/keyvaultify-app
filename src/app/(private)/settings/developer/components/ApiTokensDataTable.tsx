// src/app/(private)/settings/developer/components/ApiTokensDataTable.tsx
'use client'
import { useState } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import { Plus } from 'lucide-react'

import { ApiTokenRow } from '@/app/(private)/settings/developer/data/tokens.queries'
import { CreateApiTokenForm } from '@/app/(private)/settings/developer/components/CreateApiTokenForm'
import { TokenCreatedDialog } from '@/app/(private)/settings/developer/components/TokenCreatedDialog'
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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  projects: Array<{ id: string; name: string }>
  currentRole: 'owner' | 'admin' | 'member'
}

export function ApiTokensDataTable<TData, TValue>({
  columns,
  data,
  projects,
  currentRole
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  const [createTokenDialogOpen, setCreateTokenDialogOpen] = useState(false)
  const [createdToken, setCreatedToken] = useState<string | null>(null)

  return (
    <>
      {createdToken && (
        <TokenCreatedDialog
          token={createdToken}
          onClose={() => setCreatedToken(null)}
        />
      )}

      <AddDialog
        open={createTokenDialogOpen}
        onOpenChange={setCreateTokenDialogOpen}
        title="Create API token"
        description="Generate a new token for CLI or API access."
      >
        <CreateApiTokenForm
          projects={projects}
          currentRole={currentRole}
          setCreateTokenDialogOpen={setCreateTokenDialogOpen}
          onTokenCreated={setCreatedToken}
        />
      </AddDialog>

      <div className="flex flex-col gap-4 w-3/4 lg:w-full">
        <Button
          type="button"
          variant="outline"
          className="self-end"
          onClick={() => setCreateTokenDialogOpen(true)}
        >
          <Plus className="size-4" />
          <span className="font-bricolage-grotesque">Create Token</span>
        </Button>

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
                        No API tokens yet.
                      </p>
                      <p className="text-xs text-muted-foreground font-bricolage-grotesque">
                        Create a token to access your projects via CLI or API.
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
