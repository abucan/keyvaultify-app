import { PricingTables } from '@/components/pricing-tables'
import { Card, CardContent } from '@/components/ui/card'
import { getEntitlements } from '@/lib/entitlements'
import { Calendar, CreditCard } from 'lucide-react'

export default async function BillingSettings() {
  const ent = await getEntitlements()
  console.log(ent)

  const label = ent.plan
    ? `${ent.plan[0].toUpperCase()}${ent.plan.slice(1)} (${ent.interval})`
    : 'Hobby'

  return (
    <div className="w-3/4 flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold font-bricolage-grotesque">
          Choose a Plan
        </h1>
        <p className="text-sm text-muted-foreground font-bricolage-grotesque">
          Choose the plan that best suits your needs.
        </p>
      </div>
      <Card className="py-4 bg-muted">
        <CardContent className="flex flex-row items-center gap-4">
          <CreditCard className="p-2 bg-white rounded-lg" size={40} />
          <div>
            <h2 className="text-sm font-bold font-bricolage-grotesque capitalize">
              Current Plan: {label}
            </h2>
            <p className="text-sm text-muted-foreground font-bricolage-grotesque">
              You&apos;re currently on the Hobby plan. Select a plan to continue
              accessing premium features.
            </p>
          </div>
        </CardContent>
      </Card>
      <PricingTables />
    </div>
  )
}
