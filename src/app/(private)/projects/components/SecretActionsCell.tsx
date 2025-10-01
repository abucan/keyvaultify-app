// src/app/(private)/projects/components/SecretActionsCell.tsx
'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Pencil, Trash } from 'lucide-react'

import { deleteSecretAction } from '@/app/(private)/projects/actions/deleteSecretAction'
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
import { EditSecretForm } from './EditSecretForm'
import { AddDialog } from '@/components/shared/AddDialog'

export function SecretActionsCell({
  secretId,
  secretKey,
  secretValue,
  environmentId,
  projectId,
  canEdit,
  canDelete
}: {
  secretId: string
  secretKey: string
  secretValue: string
  environmentId: string
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
      const result = await deleteSecretAction(
        secretId,
        environmentId,
        projectId
      )

      toastRes(result, {
        success: 'Secret deleted successfully.',
        errors: {
          UNAUTHORIZED: 'You do not have permission to delete secrets.',
          NOT_FOUND: 'Secret not found.'
        }
      })

      if (result.ok) {
        setDeleteDialogOpen(false)
        router.refresh()
      }
    })
  }

  if (!canEdit && !canDelete) {
    return null
  }

  return (
    <>
      <AddDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        title="Edit secret"
        description="Update the secret key or value."
      >
        <EditSecretForm
          secretId={secretId}
          currentKey={secretKey}
          currentValue={secretValue}
          environmentId={environmentId}
          projectId={projectId}
          setEditDialogOpen={setEditDialogOpen}
        />
      </AddDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete secret</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{secretKey}</strong>? This
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
              {pending ? 'Deleting...' : 'Delete'}
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
