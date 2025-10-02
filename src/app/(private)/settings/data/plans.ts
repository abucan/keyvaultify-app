// src/app/(private)/settings/data/plans.ts
import { BasePlan } from '@/types/billing'

export const plans: BasePlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: {
      monthly: 0,
      yearly: 0
    },
    description:
      'Perfect for personal projects and getting started with secret management.',
    features: [
      '1 Organization',
      '3 Projects',
      'Unlimited Environments',
      '50 Secrets',
      '2 Team Members'
    ],
    cta: 'Get Started Free',
    limits: {
      organizations: 1,
      projects: 3,
      secrets: 50,
      environments: 'unlimited',
      teamMembers: 2
    }
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
      '2 Organizations',
      '10 Projects',
      'Unlimited Environments',
      '200 Secrets',
      '5 Team Members'
    ],
    cta: 'Subscribe to Starter',
    popular: true,
    limits: {
      organizations: 2,
      projects: 10,
      secrets: 200,
      environments: 'unlimited',
      teamMembers: 5
    }
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
      'Unlimited Secrets',
      'Unlimited Team Members'
    ],
    cta: 'Subscribe to Pro',
    limits: {
      organizations: 'unlimited',
      projects: 'unlimited',
      secrets: 'unlimited',
      environments: 'unlimited',
      teamMembers: 'unlimited'
    }
  }
]
