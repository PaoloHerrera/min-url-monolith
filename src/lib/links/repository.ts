// Repository contract + in-memory implementation for tests.
// This file is part of the TDD harness: it defines the `LinkRepository`
// interface and an `InMemoryLinkRepository` used by both unit tests and the
// route-handler integration test (injected via get/setLinkRepository).
//
// NOTE: This is NOT the production repository. The Drizzle/SQLite
// implementation (`drizzle-repository.ts`) is still to be written.

export interface ShortLink {
  shortCode: string
  shortUrl: string
  originalUrl: string
  createdAt: string
}

export interface LinkRepository {
  findByOriginalUrl(originalUrl: string): Promise<ShortLink | null>
  findByShortCode(shortCode: string): Promise<ShortLink | null>
  create(data: Omit<ShortLink, 'createdAt'>): Promise<ShortLink>
  recordVisit(shortCode: string): Promise<ShortLink | null>
  countClicks(shortCode: string): Promise<number>
}

export class InMemoryLinkRepository implements LinkRepository {
  private readonly byUrl = new Map<string, ShortLink>()
  private readonly byCode = new Map<string, ShortLink>()
  private readonly visits = new Map<string, number>()

  async findByOriginalUrl(originalUrl: string): Promise<ShortLink | null> {
    return this.byUrl.get(originalUrl) ?? null
  }

  async findByShortCode(shortCode: string): Promise<ShortLink | null> {
    return this.byCode.get(shortCode) ?? null
  }

  async create(data: Omit<ShortLink, 'createdAt'>): Promise<ShortLink> {
    const link: ShortLink = {
      ...data,
      createdAt: new Date().toISOString(),
    }
    this.byUrl.set(link.originalUrl, link)
    this.byCode.set(link.shortCode, link)
    return link
  }

  async recordVisit(shortCode: string): Promise<ShortLink | null> {
    const link = this.byCode.get(shortCode)
    if (!link) return null
    this.visits.set(shortCode, (this.visits.get(shortCode) ?? 0) + 1)
    return link
  }

  async countClicks(shortCode: string): Promise<number> {
    return this.visits.get(shortCode) ?? 0
  }
}

let currentRepository: LinkRepository | null = null

export function getLinkRepository(): LinkRepository {
  if (!currentRepository) {
    currentRepository = new InMemoryLinkRepository()
  }
  return currentRepository
}

export function setLinkRepository(repo: LinkRepository): void {
  currentRepository = repo
}
