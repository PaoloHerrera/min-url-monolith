import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { Database } from 'bun:sqlite'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import { eq, sql } from 'drizzle-orm'
import { shortLinks, linkVisits } from './schema'
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
    client.run(`
      CREATE TABLE IF NOT EXISTS short_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        short_code TEXT NOT NULL UNIQUE,
        original_url TEXT NOT NULL UNIQUE,
        short_url TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `)
    client.run(`
      CREATE TABLE IF NOT EXISTS link_visits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        short_code TEXT NOT NULL,
        visited_at TEXT NOT NULL
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

  async recordVisit(shortCode: string): Promise<ShortLink | null> {
    const link = await this.findByShortCode(shortCode)
    if (!link) return null
    await this.db.insert(linkVisits).values({
      shortCode,
      visitedAt: new Date().toISOString(),
    })
    return link
  }

  async countClicks(shortCode: string): Promise<number> {
    const rows = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(linkVisits)
      .where(eq(linkVisits.shortCode, shortCode))
    return Number(rows[0]?.count ?? 0)
  }
}
