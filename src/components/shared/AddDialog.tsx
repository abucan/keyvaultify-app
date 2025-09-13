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
          <DialogTitle className="font-bricolage-grotesque text-xl font-bold">
            {title}
          </DialogTitle>
          <DialogDescription className="font-bricolage-grotesque text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
