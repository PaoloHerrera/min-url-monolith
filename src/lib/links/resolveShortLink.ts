import type { LinkRepository, ShortLink } from './repository'

export interface ResolvedShortLink {
  originalUrl: string
  link: ShortLink
}

export async function resolveShortLink(
  repo: LinkRepository,
  shortCode: string,
): Promise<ResolvedShortLink | null> {
  const link = await repo.findByShortCode(shortCode)
  if (!link) return null

  await repo.recordVisit(shortCode)
  return { originalUrl: link.originalUrl, link }
}
