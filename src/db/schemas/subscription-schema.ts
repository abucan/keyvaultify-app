import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const stripeCustomers = sqliteTable('stripe_customers', {
  organizationId: text('organization_id').primaryKey(), // FK to Organization.id (BetterAuth)
  stripeCustomerId: text('stripe_customer_id').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`)
})

export const subscriptions = sqliteTable('subscriptions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  organizationId: text('organization_id').notNull(), // FK to BetterAuth Organization.id
  stripeSubscriptionId: text('stripe_subscription_id').unique(), // null for lifetime/one-time
  stripeCustomerId: text('stripe_customer_id').notNull(),

  status: text('status').notNull(), // 'incomplete'|'trialing'|'active'|'past_due'|'canceled'|'unpaid'
  mode: text('mode').notNull(), // 'subscription' | 'payment' (for lifetime, later)

  // Primary price snapshot (kept for quick checks; Stripe remains source of truth)
  stripePriceId: text('stripe_price_id'),
  stripeProductId: text('stripe_product_id'),
  quantity: integer('quantity'),

  currency: text('currency'), // e.g., 'usd'
  unitAmount: integer('unit_amount'), // in minor units

  currentPeriodStart: integer('current_period_start_ms', {
    mode: 'timestamp_ms'
  }),
  currentPeriodEnd: integer('current_period_end_ms', { mode: 'timestamp_ms' }),
  cancelAt: integer('cancel_at_ms', { mode: 'timestamp_ms' }),
  cancelAtPeriodEnd: integer('cancel_at_period_end_bool'),

  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`)
})
