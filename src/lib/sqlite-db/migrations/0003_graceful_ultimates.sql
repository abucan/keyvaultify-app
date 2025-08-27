CREATE TABLE `subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`stripe_subscription_id` text,
	`stripe_customer_id` text NOT NULL,
	`status` text NOT NULL,
	`mode` text NOT NULL,
	`stripe_price_id` text,
	`stripe_product_id` text,
	`quantity` integer,
	`currency` text,
	`unit_amount` integer,
	`current_period_start_ms` integer,
	`current_period_end_ms` integer,
	`cancel_at_ms` integer,
	`cancel_at_period_end_bool` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subscriptions_stripe_subscription_id_unique` ON `subscriptions` (`stripe_subscription_id`);