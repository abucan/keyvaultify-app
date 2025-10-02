// src/app/(private)/settings/utils/entitlements.ts
import 'server-only'

import { count, desc, eq } from 'drizzle-orm'

import { plans } from '@/app/(private)/settings/data/plans'
import { PRICE_IDS } from '@/app/(private)/settings/utils/price-ids'
import { environments, projects, secrets } from '@/db/schemas/app-schema'
import { member, organization } from '@/db/schemas/auth-schema'
import { subscriptions } from '@/db/schemas/subscription-schema'
import { getActiveOrgId } from '@/lib/auth/org-context'
import { auth } from '@/lib/better-auth/auth'
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

export async function getActiveSubscriptionForUser(userId?: string) {
  if (!userId) {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) return null
    userId = session.user.id
  }

  return await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, userId),
    orderBy: desc(subscriptions.updatedAt)
  })
}

export function getPlanLimits(plan?: PlanKey): PlanLimits {
  if (!plan) {
    return {
      organizations: 1,
      projects: 3,
      secrets: 50,
      environments: 'unlimited',
      teamMembers: 2
    }
  }

  const planData = plans.find(p => p.id === plan)
  return (
    planData?.limits ?? {
      organizations: 1,
      projects: 3,
      secrets: 50,
      environments: 'unlimited',
      teamMembers: 2
    }
  )
}

export async function getEntitlements(
  userId?: string
): Promise<R<Entitlements>> {
  try {
    const sub = await getActiveSubscriptionForUser(userId)
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

export async function checkProjectLimit(userId?: string): Promise<boolean> {
  try {
    if (!userId) {
      const session = await auth.api.getSession({ headers: await headers() })
      if (!session?.user) return false
      userId = session.user.id
    }

    const entitlements = await getEntitlements(userId)
    if (!entitlements.ok) return false

    const limits = entitlements.data?.limits

    // If unlimited, always allow
    if (limits?.projects === 'unlimited') return true

    // Count projects across all organizations the user belongs to
    const userMemberships = await db.query.member.findMany({
      where: eq(member.userId, userId),
      with: {
        organization: {
          with: {
            projects: true
          }
        }
      }
    })

    let totalProjects = 0
    for (const membership of userMemberships) {
      totalProjects += membership.organization.projects.length
    }

    return totalProjects < (limits?.projects ?? 0)
  } catch {
    return false
  }
}

export async function checkSecretLimit(userId?: string): Promise<boolean> {
  try {
    if (!userId) {
      const session = await auth.api.getSession({ headers: await headers() })
      if (!session?.user) return false
      userId = session.user.id
    }

    const entitlements = await getEntitlements(userId)
    if (!entitlements.ok) return false

    const limits = entitlements.data?.limits

    // If unlimited, always allow
    if (limits?.secrets === 'unlimited') return true

    // Count secrets across all organizations the user belongs to
    const userMemberships = await db.query.member.findMany({
      where: eq(member.userId, userId),
      with: {
        organization: {
          with: {
            projects: {
              with: {
                environments: {
                  with: {
                    secrets: true
                  }
                }
              }
            }
          }
        }
      }
    })

    let totalSecrets = 0
    for (const membership of userMemberships) {
      for (const project of membership.organization.projects) {
        for (const environment of project.environments) {
          totalSecrets += environment.secrets.length
        }
      }
    }

    return totalSecrets < (limits?.secrets ?? 0)
  } catch {
    return false
  }
}

export async function checkOrganizationLimit(userId?: string): Promise<boolean> {
  try {
    if (!userId) {
      const session = await auth.api.getSession({ headers: await headers() })
      if (!session?.user) return false
      userId = session.user.id
    }

    // Count organizations where user is a member
    const result = await db
      .select({ count: count() })
      .from(member)
      .where(eq(member.userId, userId))

    const currentCount = result[0]?.count ?? 0

    // Get user's subscription
    const entitlements = await getEntitlements(userId)
    if (!entitlements.ok) return false

    const limits = entitlements.data?.limits
    if (!limits) return false

    // If unlimited, always allow
    if (limits.organizations === 'unlimited') return true

    return currentCount < (limits.organizations ?? 1)
  } catch {
    return false
  }
}

export async function getUserOrganizationCount(userId?: string): Promise<number> {
  try {
    if (!userId) {
      const session = await auth.api.getSession({ headers: await headers() })
      if (!session?.user) return 0
      userId = session.user.id
    }

    const result = await db
      .select({ count: count() })
      .from(member)
      .where(eq(member.userId, userId))

    return result[0]?.count ?? 0
  } catch {
    return 0
  }
}
