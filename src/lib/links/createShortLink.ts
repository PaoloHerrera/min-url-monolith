import type { LinkRepository, ShortLink } from './repository'
import { validateUrl } from './validate-url'
import { generateShortCode } from './short-code'

export interface CreateShortLinkOptions {
  baseUrl?: string
  generateCode?: () => string
}

export const DEFAULT_BASE_URL = 'http://localhost:3000'

export async function createShortLink(
  repo: LinkRepository,
  input: { url: string },
  opts: CreateShortLinkOptions = {},
): Promise<ShortLink> {
  const validation = validateUrl(input.url)
  if (!validation.ok) {
    throw new Error(`invalid_url: ${validation.reason}`)
  }

  const normalized = validation.normalized
  const existing = await repo.findByOriginalUrl(normalized)
  if (existing) return existing

  const baseUrl = opts.baseUrl ?? DEFAULT_BASE_URL
  const generateCode = opts.generateCode ?? generateShortCode

  let code = generateCode()
  let collision = await repo.findByShortCode(code)
  while (collision) {
    code = generateCode()
    collision = await repo.findByShortCode(code)
  }

  const shortUrl = `${baseUrl}/${code}`
  return repo.create({ shortCode: code, originalUrl: normalized, shortUrl })
}
