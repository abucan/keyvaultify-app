import { drizzle } from 'drizzle-orm/better-sqlite3'

import Database from 'better-sqlite3'

import * as appSchema from '../schemas/app-schema'
import * as authSchema from '../schemas/auth-schema'
import * as subscriptionSchema from '../schemas/subscription-schema'

const fullSchema = { ...appSchema, ...authSchema, ...subscriptionSchema }

const sqlite = new Database(process.env.DATABASE_URL || './dev.db')
export const db = drizzle(sqlite, { schema: fullSchema })

export { appSchema }
export { authSchema }
export { subscriptionSchema }
export { fullSchema }

export type {
  Project,
  NewProject,
  Environment,
  NewEnvironment,
  Secret,
  NewSecret,
  ApiToken,
  NewApiToken
} from '../schemas/app-schema'
