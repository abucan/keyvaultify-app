// src/components/shared/DangerZoneCard.tsx
'use client'
import { type ReactNode, useActionState, useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'

import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { toastRes } from '@/components/toast-result'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { R } from '@/types/result'

type DangerZoneCardProps = {
  title: string
  description: string
  content: ReactNode
  formAction: (prevState?: R | undefined, formData?: FormData) => Promise<R>
  errorMessages?: Record<string, string>
  hasPermission?: boolean
}

export function DangerZoneCard({
  title,
  description,
  content,
  formAction,
  errorMessages,
  hasPermission
}: DangerZoneCardProps) {
  const [open, setOpen] = useState(false)
  const [state, boundAction] = useActionState<R | undefined, FormData>(
    formAction,
    undefined
  )

  useEffect(() => {
    if (state && state.ok === false) {
      toastRes(state, { errors: errorMessages ?? {} })
      setOpen(false)
    }
  }, [state, errorMessages])

  return (
    <Card className="w-3/4">
      <CardHeader className="gap-0">
        <CardTitle className="text-base font-bold font-bricolage-grotesque">
          {title}
        </CardTitle>
        <CardDescription className="text-sm font-bricolage-grotesque">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-row items-center gap-4">
          <AlertTriangle size={26} className="text-destructive" />
          <p className="text-sm max-w-xl font-bricolage-grotesque text-muted-foreground">
            {content}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          title={title}
          description={description}
          action={boundAction}
          hasPermission={hasPermission}
        />
      </CardFooter>
    </Card>
  )
}
