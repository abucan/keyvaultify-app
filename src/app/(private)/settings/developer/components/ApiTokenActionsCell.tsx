// src/app/(private)/settings/developer/components/ApiTokenActionsCell.tsx
'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash } from 'lucide-react'

import { revokeApiTokenAction } from '@/app/(private)/settings/developer/actions/revokeApiTokenAction'
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

export function ApiTokenActionsCell({
  tokenId,
  tokenName,
  canRevoke
}: {
  tokenId: string
  tokenName: string
  canRevoke: boolean
}) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const handleRevoke = () => {
    startTransition(async () => {
      const result = await revokeApiTokenAction(tokenId)

      toastRes(result, {
        success: 'API token revoked successfully.',
        errors: {
          UNAUTHORIZED: 'You do not have permission to revoke this token.',
          NOT_FOUND: 'API token not found.'
        }
      })

      if (result.ok) {
        setDeleteDialogOpen(false)
        router.refresh()
      }
    })
  }

  if (!canRevoke) {
    return null
  }

  return (
    <>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API token</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke <strong>{tokenName}</strong>? Any
              applications or scripts using this token will immediately lose
              access. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              disabled={pending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {pending ? 'Revoking...' : 'Revoke Token'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setDeleteDialogOpen(true)}
        className="text-destructive hover:text-destructive"
      >
        <Trash className="h-4 w-4" />
      </Button>
    </>
  )
}
