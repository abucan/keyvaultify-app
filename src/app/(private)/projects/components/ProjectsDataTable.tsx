// src/app/(private)/projects/components/ProjectsDataTable.tsx
'use client'
import { useState } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import { Plus } from 'lucide-react'

import { ProjectRow } from '@/app/(private)/projects/data/projects.queries'
import { AddProjectForm } from '@/app/(private)/projects/components/AddProjectForm'
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
}

export function ProjectsDataTable<TData, TValue>({
  columns,
  data
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  const [addProjectDialogOpen, setAddProjectDialogOpen] = useState(false)

  return (
    <>
      <AddDialog
        open={addProjectDialogOpen}
        onOpenChange={setAddProjectDialogOpen}
        title="Create project"
        description="Create a new project to manage your environment variables."
      >
        <AddProjectForm setAddProjectDialogOpen={setAddProjectDialogOpen} />
      </AddDialog>
      <div className="flex flex-col gap-4 w-3/4 lg:w-full">
        <Button
          type="button"
          variant="outline"
          className="self-end"
          onClick={() => setAddProjectDialogOpen(true)}
        >
          <Plus className="size-4" />
          <span className="font-bricolage-grotesque">Create Project</span>
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
                        No projects yet.
                      </p>
                      <p className="text-xs text-muted-foreground font-bricolage-grotesque">
                        Create your first project to get started.
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

