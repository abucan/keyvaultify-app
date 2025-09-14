// src/components/shared/ConfirmDialog.tsx
'use client'
import { useState } from 'react'
import { Trash2 } from 'lucide-react'

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

import { SubmitButton } from './SubmitButton'

type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  action: (formData: FormData) => void
  isDisabled?: boolean
  icon?: React.ReactNode
  confirmText?: string
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  action,
  isDisabled,
  icon,
  confirmText = 'DELETE'
}: ConfirmDialogProps) {
  const [confirmationText, setConfirmationText] = useState('')
  const isConfirmEnabled = confirmationText.toUpperCase() === confirmText

  const handleOpenChange = (next: boolean) => {
    if (!next) setConfirmationText('')
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="border-red-100"
          disabled={isDisabled}
        >
          {icon || <Trash2 className="w-4 h-4" />}
          <span className="text-red-500 font-bricolage-grotesque disabled:text-red-100">
            {title}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-bricolage-grotesque text-xl font-bold">
            {title}
          </DialogTitle>
          <DialogDescription className="font-bricolage-grotesque text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <form action={action}>
          <div className="py-4">
            <Input
              placeholder={`Type ${confirmText} to confirm`}
              value={confirmationText}
              onChange={e => setConfirmationText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <SubmitButton disabledLogic={!isConfirmEnabled} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
