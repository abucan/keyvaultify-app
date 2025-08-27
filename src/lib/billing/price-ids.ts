// src/lib/billing/price-ids.ts
import { BillingInterval, PlanKey } from '@/types/billing'

const must = (v: string | undefined, name: string) => {
  if (!v) throw new Error(`Missing env ${name}`)
  if (!v.startsWith('price_'))
    throw new Error(`${name} must be a Stripe Price ID (starts with "price_")`)
  return v
}

export const PRICE_IDS: Record<BillingInterval, Record<PlanKey, string>> = {
  monthly: {
    starter: must(
      process.env.STRIPE_PRICE_STARTER_MONTHLY,
      'STRIPE_PRICE_STARTER_MONTHLY'
    ),
    pro: must(process.env.STRIPE_PRICE_PRO_MONTHLY, 'STRIPE_PRICE_PRO_MONTHLY')
  },
  yearly: {
    starter: must(
      process.env.STRIPE_PRICE_STARTER_YEARLY,
      'STRIPE_PRICE_STARTER_YEARLY'
    ),
    pro: must(process.env.STRIPE_PRICE_PRO_YEARLY, 'STRIPE_PRICE_PRO_YEARLY')
  }
}
