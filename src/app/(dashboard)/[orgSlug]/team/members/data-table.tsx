// src/app/(dashboard)/[orgSlug]/team/members/data-table.tsx
'use client'
import { useState } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import { Plus } from 'lucide-react'

import { AddDialog } from '@/components/shared/AddDialog'
import { AddMemberForm } from '@/components/team/AddMemberForm'
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
import { requireAdminOrOwner } from '@/lib/utils/helpers'
import { MemberRow, Role } from '@/types/auth'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  currentUser: MemberRow | null
}

export function DataTable<TData, TValue>({
  columns,
  data,
  currentUser
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false)

  return (
    <>
      <AddDialog
        open={addMemberDialogOpen}
        onOpenChange={setAddMemberDialogOpen}
        title="Add member"
        description="Add a new member to your team."
      >
        <AddMemberForm />
      </AddDialog>
      <div className="flex flex-col gap-4 w-3/4">
        <Button
          variant="outline"
          className="border-primary"
          onClick={() => setAddMemberDialogOpen(true)}
          disabled={
            !requireAdminOrOwner(currentUser?.role as Role) ||
            currentUser?._meta?.isPersonalOrg
          }
        >
          <Plus className="size-4 text-primary-foreground" />
          <span className="text-primary-foreground font-bricolage-grotesque">
            Add Member
          </span>
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
                    No results.
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
