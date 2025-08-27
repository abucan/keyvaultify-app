// src/data/plans.ts
import { BasePlan } from '@/types/billing'

export const plans: BasePlan[] = [
  {
    id: 'hobby',
    name: 'Hobby',
    price: {
      monthly: 0,
      yearly: 0
    },
    description:
      'The perfect starting place for your web app or personal project.',
    features: [
      '1 Organization',
      '2 Projects',
      '2 Environments per project',
      '20 Secrets'
    ],
    cta: 'Get started for free'
  },
  {
    id: 'starter',
    name: 'Starter',
    price: {
      monthly: 4.99,
      yearly: 49.99
    },
    description:
      'The perfect starting place for your web app or personal project.',
    features: [
      '2 Organization',
      '10 Projects',
      'Unlimited Environments',
      '100 Secrets'
    ],
    cta: 'Subscribe to Starter',
    popular: true
  },
  {
    id: 'pro',
    name: 'Pro',
    price: {
      monthly: 8.99,
      yearly: 89.99
    },
    description:
      'For personal projects or small teams looking for additional features.',
    features: [
      'Unlimited Organizations',
      'Unlimited Projects',
      'Unlimited Environments',
      'Unlimited Secrets'
    ],
    cta: 'Subscribe to Pro'
  }
]
