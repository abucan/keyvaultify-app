import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const projects = sqliteTable('projects', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  description: text('description'),
  userId: text('userId').notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(
    sql`CURRENT_TIMESTAMP`
  ),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(
    sql`CURRENT_TIMESTAMP`
  ),
});

export const environments = sqliteTable('environments', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  description: text('description'),
  projectId: text('projectId')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(
    sql`CURRENT_TIMESTAMP`
  ),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(
    sql`CURRENT_TIMESTAMP`
  ),
});

export const secrets = sqliteTable('secrets', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  key: text('key').notNull(),
  value: text('value').notNull(), // this will be encrypted
  environmentId: text('environmentId')
    .notNull()
    .references(() => environments.id, { onDelete: 'cascade' }),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(
    sql`CURRENT_TIMESTAMP`
  ),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(
    sql`CURRENT_TIMESTAMP`
  ),
});

export const apiTokens = sqliteTable('api_tokens', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  token: text('token').notNull().unique(),
  userId: text('userId').notNull(), // references auth-schema.user.id
  lastUsed: integer('lastUsed', { mode: 'timestamp' }),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(
    sql`CURRENT_TIMESTAMP`
  ),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(
    sql`CURRENT_TIMESTAMP`
  ),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Environment = typeof environments.$inferSelect;
export type NewEnvironment = typeof environments.$inferInsert;
export type Secret = typeof secrets.$inferSelect;
export type NewSecret = typeof secrets.$inferInsert;
export type ApiToken = typeof apiTokens.$inferSelect;
export type NewApiToken = typeof apiTokens.$inferInsert;
