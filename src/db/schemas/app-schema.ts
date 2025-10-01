// src/db/schemas/app-schema.ts
import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { organization } from './auth-schema'

export const projects = sqliteTable('projects', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  description: text('description'),
  slug: text('slug'),
  organizationId: text('organizationId')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  createdBy: text('createdBy').notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
})

export const environments = sqliteTable('environments', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  description: text('description'),
  projectId: text('projectId')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  createdAt: integer('createdAt', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
})

export const secrets = sqliteTable('secrets', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  key: text('key').notNull(),
  value: text('value').notNull(), // this will be encrypted
  environmentId: text('environmentId')
    .notNull()
    .references(() => environments.id, { onDelete: 'cascade' }),
  createdAt: integer('createdAt', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
})
// Note: Unique constraint on (environmentId, key) is enforced at application level
// in createSecret() and updateSecret() mutations to prevent duplicate keys per environment

export const apiTokens = sqliteTable('api_tokens', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  tokenHash: text('tokenHash').notNull().unique(), // bcrypt hash of the token
  tokenPrefix: text('tokenPrefix').notNull(), // First 8 chars for display (e.g., "kvf_Ab3c")
  organizationId: text('organizationId')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  projectId: text('projectId').references(() => projects.id, {
    onDelete: 'cascade'
  }), // null = all projects
  createdBy: text('createdBy').notNull(), // userId who created it
  lastUsed: integer('lastUsed', { mode: 'timestamp' }),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }), // null = never expires
  createdAt: integer('createdAt', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
})

export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert
export type Environment = typeof environments.$inferSelect
export type NewEnvironment = typeof environments.$inferInsert
export type Secret = typeof secrets.$inferSelect
export type NewSecret = typeof secrets.$inferInsert
export type ApiToken = typeof apiTokens.$inferSelect
export type NewApiToken = typeof apiTokens.$inferInsert
