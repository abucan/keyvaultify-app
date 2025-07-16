import { drizzle } from 'drizzle-orm/better-sqlite3';

import Database from 'better-sqlite3';

import * as schema from './schema';
import * as authSchema from '../../../auth-schema';

const fullSchema = { ...schema, ...authSchema };

const sqlite = new Database(process.env.DATABASE_URL || './dev.db');
export const db = drizzle(sqlite, { schema: fullSchema });

export { schema };
export { authSchema };
export { fullSchema };

export type {
  Project,
  NewProject,
  Environment,
  NewEnvironment,
  Secret,
  NewSecret,
  ApiToken,
  NewApiToken,
} from './schema';
