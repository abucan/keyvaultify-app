// src/types/billing.ts
export type PlanKey = 'starter' | 'pro'
export type BillingInterval = 'monthly' | 'yearly'

type SubStatus =
  | 'incomplete'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'

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
}

export type Entitlements = {
  isActive: boolean
  status: SubStatus
  plan: PlanKey | undefined
  interval: BillingInterval | undefined
  currentPeriodEnd: Date | null
}
