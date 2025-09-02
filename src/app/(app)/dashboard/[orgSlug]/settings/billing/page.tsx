// src/app/(app)/settings/billing/page.tsx
import { CurrentPlanCard } from '@/components/billing/CurrentPlanCard'
import { PricingTables } from '@/components/billing/PricingTables'
import { getEntitlements } from '@/lib/billing/entitlements'

export default async function BillingSettingsPage() {
  const ent = await getEntitlements()

  const plan_name = ent.plan
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
      <CurrentPlanCard plan_name={plan_name} />
      <PricingTables />
    </div>
  )
}
