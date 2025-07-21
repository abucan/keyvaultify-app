// Migration steps from SQLite to PostgreSQL

/* 
STEP 1: Update your schema for PostgreSQL
In src/lib/db/schema.ts, change imports:

FROM:
import { integer, sqliteTable, text, primaryKey } from 'drizzle-orm/sqlite-core';

TO:
import { integer, pgTable, text, varchar, timestamp, primaryKey } from 'drizzle-orm/pg-core';

STEP 2: Update table definitions
FROM:
export const users = sqliteTable('user', {
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

TO:
export const users = pgTable('user', {
  createdAt: timestamp('createdAt').default(sql`CURRENT_TIMESTAMP`),
});

STEP 3: Update database connection
In src/lib/db/index.ts:

FROM:
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
const sqlite = new Database('./dev.db');
export const db = drizzle(sqlite, { schema });

TO:
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
export const db = drizzle(pool, { schema });

STEP 4: Update drizzle.config.ts
FROM:
dialect: 'sqlite',
dbCredentials: { url: './dev.db' }

TO:
dialect: 'postgresql',
dbCredentials: { url: process.env.DATABASE_URL! }

STEP 5: Update BetterAuth adapter
In src/lib/auth.ts:
FROM:
drizzleAdapter(db, { provider: "sqlite" })

TO:
drizzleAdapter(db, { provider: "pg" })

STEP 6: Environment variables
Add to .env.local:
DATABASE_URL=postgresql://username:password@localhost:5432/keyvaultify

STEP 7: Generate and run migrations
npm run db:generate
npm run db:migrate
*/

// Example environment variables for different stages:
export const environmentConfig = {
  development: {
    DATABASE_URL: './dev.db', // SQLite
    BETTER_AUTH_SECRET: 'dev-secret-key',
    BETTER_AUTH_URL: 'http://localhost:3000',
  },
  production: {
    DATABASE_URL: 'postgresql://user:pass@host:5432/db', // PostgreSQL
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET!,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL!,
  }
};