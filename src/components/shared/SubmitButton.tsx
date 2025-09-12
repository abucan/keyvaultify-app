import { Loader } from 'lucide-react'
import { useFormStatus } from 'react-dom'

import { Button } from '../ui/button'

export function SubmitButton({ disabledLogic }: { disabledLogic: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      variant="destructive"
      disabled={disabledLogic || pending}
    >
      {pending ? (
        <div className="flex flex-row items-center justify-center gap-2">
          <Loader className="animate-spin" />
          <span>Working...</span>
        </div>
      ) : (
        <span>Confirm</span>
      )}
    </Button>
  )
}
