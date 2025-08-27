import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: [
    './src/db/schemas/app-schema.ts',
    './src/db/schemas/auth-schema.ts',
    './src/db/schemas/subscription-schema.ts'
  ],
  out: './src/lib/sqlite-db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url:
      process.env.NODE_ENV === 'production'
        ? process.env.DATABASE_URL!
        : './dev.db'
  },
  verbose: true,
  strict: true
})
