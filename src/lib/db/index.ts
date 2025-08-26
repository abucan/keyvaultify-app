import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'

import * as appSchema from '../../db/schemas/app-schema'
import * as authSchema from '../../db/schemas/auth-schema'
import * as subscriptionSchema from '../../db/schemas/subscription-schema'

const fullSchema = { ...appSchema, ...authSchema, ...subscriptionSchema }

const sqlite = new Database(process.env.DATABASE_URL || './dev.db')
export const db = drizzle(sqlite, { schema: fullSchema })

export { appSchema }
export { authSchema }
export { subscriptionSchema }
export { fullSchema }

export type {
  ApiToken,
  Environment,
  NewApiToken,
  NewEnvironment,
  NewProject,
  NewSecret,
  Project,
  Secret} from '../../db/schemas/app-schema'
