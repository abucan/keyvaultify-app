// src/types/billing.ts
export type PlanKey = 'free' | 'starter' | 'pro'
export type BillingInterval = 'monthly' | 'yearly'

type SubStatus =
  | 'incomplete'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'

export type PlanLimits = {
  organizations: number | 'unlimited'
  projects: number | 'unlimited'
  secrets: number | 'unlimited'
  environments: 'unlimited'
  teamMembers: number | 'unlimited'
}

export type BasePlan = {
  id: string
  name: string
  price: {
    monthly: number
    yearly: number
  }
  description: string
  features: string[]
  cta: string
  popular?: boolean
  limits: PlanLimits
}

export type Entitlements = {
  isActive: boolean
  status: SubStatus
  plan: PlanKey | undefined
  interval: BillingInterval | undefined
  currentPeriodEnd: Date | null
  limits: PlanLimits
}
