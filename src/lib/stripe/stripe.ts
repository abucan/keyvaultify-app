// src/lib/stripe/stripe.ts
import Stripe from 'stripe'

// initialize stripe to use stripe default api version
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
