// src/components/shared/ConfirmDialog.tsx
'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'

import { Input } from '../ui/input'

interface ConfirmDialogProps {
  triggerButton: React.ReactNode
  title: string
  description: string
  onConfirm: () => Promise<void> | void
  disabled?: boolean
  loadingText?: string
}

export function ConfirmDialog({
  triggerButton,
  title,
  description,
  onConfirm,
  disabled = false,
  loadingText = 'Loading...'
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [confirmationText, setConfirmationText] = useState('')

  const handleConfirm = async () => {
    try {
      setIsLoading(true)
      await onConfirm()
      setOpen(false)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const isConfirmEnabled = confirmationText.toUpperCase() === 'DELETE'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-bricolage-grotesque text-xl font-bold">
            {title}
          </DialogTitle>
          <DialogDescription className="font-bricolage-grotesque text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="Type DELETE to confirm"
            value={confirmationText}
            onChange={e => setConfirmationText(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={disabled || isLoading || !isConfirmEnabled}
          >
            {isLoading ? loadingText : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
