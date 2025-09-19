// src/app/(private)/settings/billing/page.tsx
import { CurrentPlanCard } from '@/components/billing/CurrentPlanCard'
import { ManageBillingCard } from '@/components/billing/ManageBillingCard'
import { PricingTables } from '@/components/billing/PricingTables'
import { getEntitlements } from '@/lib/billing/entitlements'

export default async function BillingSettingsPage() {
  const ent = await getEntitlements()
  return (
    <>
      {ent.ok && ent.data && (
        <div className="w-3/4 flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold font-bricolage-grotesque">
              Choose a Plan
            </h1>
            <p className="text-sm text-muted-foreground font-bricolage-grotesque">
              Choose the plan that best suits your needs.
            </p>
          </div>
          <CurrentPlanCard ent={ent?.data} />
          <PricingTables currentPlan={ent.data?.plan} />
          {ent?.data?.isActive && <ManageBillingCard />}
        </div>
      )}
    </>
  )
}
