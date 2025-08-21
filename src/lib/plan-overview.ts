export const plans = [
  {
    id: 'hobby',
    name: 'Hobby',
    price: {
      monthly: 'Free forever',
      yearly: 'Free forever'
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
      monthly: 5,
      yearly: 50
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
      monthly: 10,
      yearly: 100
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
