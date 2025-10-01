// src/app/(private)/projects/components/EnvironmentActionsCell.tsx
'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Pencil, Trash } from 'lucide-react'

import { deleteEnvironmentAction } from '@/app/(private)/projects/actions/deleteEnvironmentAction'
import { toastRes } from '@/components/toast-result'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { EditEnvironmentForm } from './EditEnvironmentForm'
import { AddDialog } from '@/components/shared/AddDialog'

export function EnvironmentActionsCell({
  envId,
  envName,
  envDescription,
  projectId,
  canEdit,
  canDelete
}: {
  envId: string
  envName: string
  envDescription: string | null
  projectId: string
  canEdit: boolean
  canDelete: boolean
}) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteEnvironmentAction(envId, projectId)

      toastRes(result, {
        success: 'Environment deleted successfully.',
        errors: {
          UNAUTHORIZED: 'You do not have permission to delete environments.',
          NOT_FOUND: 'Environment not found.'
        }
      })

      if (result.ok) {
        setDeleteDialogOpen(false)
        router.refresh()
      }
    })
  }

  if (!canEdit && !canDelete) {
    return <span className="text-xs text-muted-foreground">Default</span>
  }

  return (
    <>
      <AddDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        title="Edit environment"
        description="Update the environment name or description."
      >
        <EditEnvironmentForm
          envId={envId}
          currentName={envName}
          currentDescription={envDescription || ''}
          projectId={projectId}
          setEditDialogOpen={setEditDialogOpen}
        />
      </AddDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete environment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{envName}</strong>? This
              will permanently remove all secrets in this environment. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={pending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {pending ? 'Deleting...' : 'Delete Environment'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canEdit && (
            <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
          )}
          {canDelete && (
            <DropdownMenuItem
              onClick={() => setDeleteDialogOpen(true)}
              className="text-destructive"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
