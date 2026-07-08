import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const shortLinks = sqliteTable('short_links', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  shortCode: text('short_code').notNull().unique(),
  originalUrl: text('original_url').notNull().unique(),
  shortUrl: text('short_url').notNull(),
  createdAt: text('created_at').notNull(),
})

export type ShortLinkRow = typeof shortLinks.$inferSelect
