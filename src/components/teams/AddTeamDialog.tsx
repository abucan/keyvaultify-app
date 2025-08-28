import { Plus } from 'lucide-react'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'

import { Button } from '../ui/button'

import { AddTeamForm } from './AddTeamForm'

type AddTeamDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddTeamDialog({ open, onOpenChange }: AddTeamDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add team</DialogTitle>
          <DialogDescription>
            Add a new team to your organization.
          </DialogDescription>
        </DialogHeader>
        <AddTeamForm />
      </DialogContent>
    </Dialog>
  )
}
