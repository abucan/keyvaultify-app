// lib/types/billing.ts
export type PlanKey = 'starter' | 'pro'
export type BillingInterval = 'monthly' | 'yearly'

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
