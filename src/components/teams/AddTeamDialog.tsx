import { Plus } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'

export function AddTeamDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex flex-row items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
            <Plus className="size-4" />
          </div>
          <div className="text-muted-foreground font-medium">Add team</div>
        </div>
      </DialogTrigger>
      <DialogContent></DialogContent>
    </Dialog>
  )
}
