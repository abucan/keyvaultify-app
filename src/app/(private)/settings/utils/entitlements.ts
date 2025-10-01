// src/app/(private)/settings/utils/entitlements.ts
import 'server-only'

import { count, desc, eq } from 'drizzle-orm'

import { plans } from '@/app/(private)/settings/data/plans'
import { PRICE_IDS } from '@/app/(private)/settings/utils/price-ids'
import { environments, projects, secrets } from '@/db/schemas/app-schema'
import { subscriptions } from '@/db/schemas/subscription-schema'
import { getActiveOrgId } from '@/lib/auth/org-context'
import { db } from '@/lib/sqlite-db'
import {
  BillingInterval,
  Entitlements,
  PlanKey,
  PlanLimits
} from '@/types/billing'
import { R } from '@/types/result'

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

export function getPlanLimits(plan?: PlanKey): PlanLimits {
  if (!plan) {
    return {
      projects: 3,
      secrets: 20,
      environments: 'unlimited'
    }
  }

  const planData = plans.find(p => p.id === plan)
  return (
    planData?.limits ?? {
      projects: 3,
      secrets: 20,
      environments: 'unlimited'
    }
  )
}

export async function getEntitlements(
  orgId?: string
): Promise<R<Entitlements>> {
  try {
    const sub = await getActiveSubscriptionForOrg(orgId)
    if (!sub) {
      const limits = getPlanLimits(undefined)
      return {
        ok: true,
        data: {
          isActive: false,
          status: 'trialing',
          plan: undefined,
          interval: undefined,
          currentPeriodEnd: null,
          limits
        }
      }
    }

    const status = sub.status as SubStatus
    const planInfo = priceToPlan(sub.stripePriceId ?? undefined)
    const limits = getPlanLimits(planInfo?.plan)

    return {
      ok: true,
      data: {
        isActive: ACTIVE.includes(status),
        status,
        plan: planInfo?.plan,
        interval: planInfo?.interval,
        currentPeriodEnd: sub.currentPeriodEnd ?? null,
        limits
      }
    }
  } catch {
    return {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: 'Internal error'
    }
  }
}

export async function requirePaidOrg(orgId?: string) {
  const res = await getEntitlements(orgId)
  if (!res.ok) throw new Error('Billing required')
}

export async function checkProjectLimit(orgId?: string): Promise<boolean> {
  try {
    const oid = orgId ?? (await getActiveOrgId())
    if (!oid) return false

    const entitlements = await getEntitlements(oid)
    if (!entitlements.ok) return false

    const limits = entitlements.data?.limits

    // If unlimited, always allow
    if (limits?.projects === 'unlimited') return true

    // Count existing projects for this org
    const result = await db
      .select({ count: count() })
      .from(projects)
      .where(eq(projects.organizationId, oid))

    const currentCount = result[0]?.count ?? 0

    return currentCount < (limits?.projects ?? 0)
  } catch {
    return false
  }
}

export async function checkSecretLimit(orgId?: string): Promise<boolean> {
  try {
    const oid = orgId ?? (await getActiveOrgId())
    if (!oid) return false

    const entitlements = await getEntitlements(oid)
    if (!entitlements.ok) return false

    const limits = entitlements.data?.limits

    // If unlimited, always allow
    if (limits?.secrets === 'unlimited') return true

    // Count existing secrets across all projects in this org
    const result = await db
      .select({ count: count() })
      .from(secrets)
      .innerJoin(environments, eq(secrets.environmentId, environments.id))
      .innerJoin(projects, eq(environments.projectId, projects.id))
      .where(eq(projects.organizationId, oid))

    const currentCount = result[0]?.count ?? 0

    return currentCount < (limits?.secrets ?? 0)
  } catch {
    return false
  }
}
