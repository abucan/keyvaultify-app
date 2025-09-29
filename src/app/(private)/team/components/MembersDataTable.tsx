// src/app/(private)/team/components/MembersDataTable.tsx
'use client'
import { useState } from 'react'
import { TooltipTrigger } from '@radix-ui/react-tooltip'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import { Plus } from 'lucide-react'

import { AddMemberForm } from '@/app/(private)/team/components/AddMemberForm'
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider
} from '@/components/ui/tooltip'
import { MemberRow, Role } from '@/types/auth'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  currentUser: MemberRow | null
}

export function MembersDataTable<TData, TValue>({
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

  function requireAdminOrOwner(role: Role) {
    return role === 'admin' || role === 'owner'
  }

  const isDisabled =
    !requireAdminOrOwner(currentUser?.role as Role) ||
    currentUser?._meta?.isPersonalOrg

  return (
    <>
      <AddDialog
        open={addMemberDialogOpen}
        onOpenChange={setAddMemberDialogOpen}
        title="Add member"
        description="Add a new member to your team."
      >
        <AddMemberForm
          setAddMemberDialogOpen={setAddMemberDialogOpen}
          defaultRole={currentUser?._meta?.defaultRole as Role}
        />
      </AddDialog>
      <div className="flex flex-col gap-4 w-3/4 lg:w-full">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {isDisabled ? (
                <Button
                  type="button"
                  variant="outline"
                  className="self-end"
                  onClick={() => setAddMemberDialogOpen(true)}
                  disabled
                >
                  <Plus className="size-4" />
                  <span className="font-bricolage-grotesque">Add Member</span>
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="self-end"
                  onClick={() => setAddMemberDialogOpen(true)}
                >
                  <Plus className="size-4" />
                  <span className="font-bricolage-grotesque">Add Member</span>
                </Button>
              )}
            </TooltipTrigger>
            {isDisabled && (
              <TooltipContent>
                This is a personal organization. You cannot add members.
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
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
