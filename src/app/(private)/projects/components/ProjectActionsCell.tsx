// src/app/(private)/projects/components/ProjectActionsCell.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Edit, Trash2, Folder } from 'lucide-react'

import { deleteProjectAction } from '@/app/(private)/projects/actions/deleteProjectAction'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
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
import { toastRes } from '@/components/toast-result'

interface ProjectActionsCellProps {
  projectId: string
  projectName: string
  projectDescription?: string | null
}

export function ProjectActionsCell({
  projectId,
  projectName,
  projectDescription
}: ProjectActionsCellProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await deleteProjectAction(projectId)
      toastRes(res, {
        errors: {
          UNAUTHORIZED: 'You do not have permission to delete this project.',
          NOT_FOUND: 'Project not found.',
          UNKNOWN: 'Failed to delete project. Please try again.'
        }
      })

      if (res.ok) {
        setDeleteDialogOpen(false)
        router.refresh()
      }
    } catch (error) {
      console.error('Delete project error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link
              href={`/projects/${projectId}`}
              className="flex items-center gap-2"
            >
              <Folder className="h-4 w-4" />
              View Project
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href={`/projects/${projectId}/settings`}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Project
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Delete Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{projectName}</strong>?
              <br />
              <br />
              This action cannot be undone. This will permanently delete the
              project, all its environments, and all secrets.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete Project'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
