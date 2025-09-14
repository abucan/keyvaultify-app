import { Loader } from 'lucide-react'
import { Button } from '../ui/button'

export function AddButton({
  disabledLogic,
  title,
  loadingTitle
}: {
  disabledLogic: boolean
  title: string
  loadingTitle: string
}) {
  return (
    <Button
      type="submit"
      variant="default"
      className="w-full"
      disabled={disabledLogic}
    >
      {disabledLogic ? (
        <div className="flex flex-row items-center justify-center gap-2">
          <Loader className="animate-spin" />
          <span>{loadingTitle}</span>
        </div>
      ) : (
        <span>{title}</span>
      )}
    </Button>
  )
}
