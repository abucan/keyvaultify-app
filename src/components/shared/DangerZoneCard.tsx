// src/components/shared/DangerZoneCard.tsx
import { AlertTriangle } from 'lucide-react'
import { Trash2 } from 'lucide-react'

import { Result } from '@/types/auth'

import { Button } from '../ui/button'
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
  onConfirm: () => Promise<Result> | void
  loadingText?: string
  disabled?: boolean
}

export function DangerZoneCard({
  title,
  description,
  content,
  onConfirm,
  loadingText
}: DangerZoneCardProps) {
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
        <div className="flex flex-row items-start gap-4">
          <AlertTriangle size={40} className="text-destructive" />
          <p className="text-sm font-bricolage-grotesque text-muted-foreground">
            {content}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <ConfirmDialog
          triggerButton={
            <Button variant={'destructive'}>
              <Trash2 className="w-4 h-4" />
              {title}
            </Button>
          }
          title={title}
          description={description}
          onConfirm={onConfirm}
          loadingText={loadingText}
        />
      </CardFooter>
    </Card>
  )
}
