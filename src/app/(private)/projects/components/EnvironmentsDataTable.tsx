// src/app/(private)/projects/components/EnvironmentsDataTable.tsx
'use client'
import { useMemo, useState } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import { Plus } from 'lucide-react'

import { EnvironmentRow } from '@/app/(private)/projects/data/projects.queries'
import { createEnvironmentsColumns } from '@/app/(private)/projects/components/EnvironmentsColumns'
import { AddEnvironmentForm } from '@/app/(private)/projects/components/AddEnvironmentForm'
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
  data: EnvironmentRow[]
  projectId: string
}

export function EnvironmentsDataTable({ data, projectId }: DataTableProps) {
  const columns = useMemo(
    () => createEnvironmentsColumns(projectId),
    [projectId]
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  const [addEnvironmentDialogOpen, setAddEnvironmentDialogOpen] =
    useState(false)

  return (
    <>
      <AddDialog
        open={addEnvironmentDialogOpen}
        onOpenChange={setAddEnvironmentDialogOpen}
        title="Create environment"
        description="Add a new environment to this project."
      >
        <AddEnvironmentForm
          projectId={projectId}
          setAddEnvironmentDialogOpen={setAddEnvironmentDialogOpen}
        />
      </AddDialog>
      <div className="flex flex-col gap-4 w-3/4 lg:w-full">
        <Button
          type="button"
          variant="outline"
          className="self-end"
          onClick={() => setAddEnvironmentDialogOpen(true)}
        >
          <Plus className="size-4" />
          <span className="font-bricolage-grotesque">Add Environment</span>
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
                        No environments yet.
                      </p>
                      <p className="text-xs text-muted-foreground font-bricolage-grotesque">
                        Projects are created with 3 default environments.
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
