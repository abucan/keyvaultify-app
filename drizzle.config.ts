import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: [
    './src/lib/schemas/app-schema.ts',
    './src/lib/schemas/auth-schema.ts',
    './src/lib/schemas/subscription-schema.ts'
  ],
  out: './src/lib/db/migrations',
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
