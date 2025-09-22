// src/components/billing/CurrentPlanCard.tsx
import { CreditCard } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Entitlements } from '@/types/billing'

export function CurrentPlanCard({ ent }: { ent: Entitlements }) {
  const currentPlan = ent.plan
    ? `${ent.plan[0].toUpperCase()}${ent.plan.slice(1)} (${ent.interval})`
    : 'Hobby'

  return (
    <Card className="py-4 bg-muted">
      <CardContent className="flex flex-row items-center gap-4">
        <CreditCard className="p-2 bg-white rounded-lg" size={40} />
        <div>
          <h2 className="text-sm font-bold font-bricolage-grotesque capitalize">
            Current Plan: {currentPlan}
          </h2>
          {ent.status === 'active' && (
            <p className="text-sm font-medium text-muted-foreground font-bricolage-grotesque capitalize">
              Your subscription renews on{' '}
              {ent.currentPeriodEnd?.toLocaleDateString()}
            </p>
          )}
          {ent.status === 'canceled' && (
            <p className="text-sm font-medium text-muted-foreground font-bricolage-grotesque capitalize">
              Your subscription is canceled and stop on{' '}
              {ent.currentPeriodEnd?.toLocaleDateString()}
            </p>
          )}

          {ent.plan !== 'starter' && ent.plan !== 'pro' && (
            <p className="text-sm text-muted-foreground font-bricolage-grotesque">
              You&apos;re currently on the Hobby plan. Select a plan to continue
              accessing premium features.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
