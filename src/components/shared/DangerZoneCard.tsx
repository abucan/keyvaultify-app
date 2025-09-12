// src/components/shared/DangerZoneCard.tsx
'use client'
import { useActionState, useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'

import { R } from '@/types/result'

import { toastRes } from '../toast-result'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '../ui/card'

import { ConfirmDialog } from './ConfirmDialog'

type DangerZoneCardProps = {
  title: string
  description: string
  content: string
  formAction: (prevState?: R | undefined, formData?: FormData) => Promise<R>
  errorMessages?: Record<string, string>
}

export function DangerZoneCard({
  title,
  description,
  content,
  formAction,
  errorMessages
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
        />
      </CardFooter>
    </Card>
  )
}
