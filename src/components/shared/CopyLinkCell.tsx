// src/components/shared/CopyLinkCell.tsx
'use client'
import { Copy } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'

export function CopyLinkCell({
  url,
  canCopy
}: {
  url: string
  canCopy: boolean
}) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Invitation link copied')
    } catch {
      toast.error('Could not copy link')
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          onClick={copy}
          disabled={!canCopy}
        >
          <Copy className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Copy invitation link</p>
      </TooltipContent>
    </Tooltip>
  )
}
