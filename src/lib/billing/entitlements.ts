// src/lib/billing/entitlements.ts
import 'server-only'

import { desc, eq } from 'drizzle-orm'

import { subscriptions } from '@/db/schemas/subscription-schema'
import { getActiveOrgId } from '@/lib/auth/org-context'
import { PRICE_IDS } from '@/lib/billing/price-ids'
import { db } from '@/lib/sqlite-db'
import { BillingInterval, PlanKey } from '@/types/billing'

type SubStatus =
  | 'incomplete'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
const ACTIVE: SubStatus[] = ['trialing', 'active', 'past_due'] // treat past_due as limited-active

const priceToPlan = (() => {
  const map = new Map<string, { plan: PlanKey; interval: BillingInterval }>()
  ;(Object.keys(PRICE_IDS) as BillingInterval[]).forEach(interval => {
    ;(Object.keys(PRICE_IDS[interval]) as PlanKey[]).forEach(plan => {
      map.set(PRICE_IDS[interval][plan], { plan, interval })
    })
  })
  return (priceId?: string | null) => (priceId ? map.get(priceId) : undefined)
})()

export async function getActiveSubscriptionForOrg(orgId?: string) {
  const oid = orgId ?? (await getActiveOrgId())
  if (!oid) return null

  // If you enforce one row per org, this just returns that row.
  return await db.query.subscriptions.findFirst({
    where: eq(subscriptions.organizationId, oid),
    orderBy: desc(subscriptions.updatedAt)
  })
}

export async function getEntitlements(orgId?: string) {
  const sub = await getActiveSubscriptionForOrg(orgId)
  if (!sub) {
    return {
      isActive: false,
      status: 'canceled' as SubStatus,
      plan: undefined as PlanKey | undefined,
      interval: undefined as BillingInterval | undefined,
      currentPeriodEnd: null as Date | null
    }
  }

  const status = sub.status as SubStatus
  const planInfo = priceToPlan(sub.stripePriceId ?? undefined)

  return {
    isActive: ACTIVE.includes(status),
    status,
    plan: planInfo?.plan,
    interval: planInfo?.interval,
    currentPeriodEnd: sub.currentPeriodEnd ?? null
  }
}

export async function requirePaidOrg(orgId?: string) {
  const { isActive } = await getEntitlements(orgId)
  if (!isActive) throw new Error('Billing required')
}
