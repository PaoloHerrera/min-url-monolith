import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { eq } from 'drizzle-orm'
import { shortLinks } from './schema'
import type { LinkRepository, ShortLink } from './repository'

const DB_PATH = process.env.MIN_URL_DB ?? 'data/min-url.db'

function toShortLink(row: typeof shortLinks.$inferSelect): ShortLink {
  return {
    shortCode: row.shortCode,
    shortUrl: row.shortUrl,
    originalUrl: row.originalUrl,
    createdAt: row.createdAt,
  }
}

export class DrizzleLinkRepository implements LinkRepository {
  private readonly db

  constructor(path: string = DB_PATH) {
    mkdirSync(dirname(path), { recursive: true })
    const client = new Database(path)
    client.exec(`
      CREATE TABLE IF NOT EXISTS short_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        short_code TEXT NOT NULL UNIQUE,
        original_url TEXT NOT NULL UNIQUE,
        short_url TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `)
    this.db = drizzle(client)
  }

  async findByOriginalUrl(originalUrl: string): Promise<ShortLink | null> {
    const rows = await this.db
      .select()
      .from(shortLinks)
      .where(eq(shortLinks.originalUrl, originalUrl))
      .limit(1)
    return rows[0] ? toShortLink(rows[0]) : null
  }

  async findByShortCode(shortCode: string): Promise<ShortLink | null> {
    const rows = await this.db
      .select()
      .from(shortLinks)
      .where(eq(shortLinks.shortCode, shortCode))
      .limit(1)
    return rows[0] ? toShortLink(rows[0]) : null
  }

  async create(data: Omit<ShortLink, 'createdAt'>): Promise<ShortLink> {
    const createdAt = new Date().toISOString()
    const rows = await this.db
      .insert(shortLinks)
      .values({ ...data, createdAt })
      .returning()
    return toShortLink(rows[0])
  }
}
