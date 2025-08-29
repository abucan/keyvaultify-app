// src/components/shared/AddDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

type AddDialogProps = {
  title: string
  description: string
  open: boolean
  children: React.ReactNode
  onOpenChange: (open: boolean) => void
}

export function AddDialog({
  title,
  description,
  open,
  onOpenChange,
  children
}: AddDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
