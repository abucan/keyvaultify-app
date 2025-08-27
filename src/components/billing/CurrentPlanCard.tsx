// src/components/billing/CurrentPlanCard.tsx
import { CreditCard } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

interface CurrentPlanCardProps {
  plan_name: string
}

export function CurrentPlanCard({ plan_name }: CurrentPlanCardProps) {
  return (
    <Card className="py-4 bg-muted">
      <CardContent className="flex flex-row items-center gap-4">
        <CreditCard className="p-2 bg-white rounded-lg" size={40} />
        <div>
          <h2 className="text-sm font-bold font-bricolage-grotesque capitalize">
            Current Plan: {plan_name}
          </h2>
          <p className="text-sm text-muted-foreground font-bricolage-grotesque">
            You&apos;re currently on the Hobby plan. Select a plan to continue
            accessing premium features.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
