import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryLinkRepository, type LinkRepository } from '@/src/lib/links/repository'
import { resolveShortLink } from '@/src/lib/links/resolveShortLink'

const DEFAULT_BASE_URL = 'http://localhost:3000'

function makeRepo(): LinkRepository {
  return new InMemoryLinkRepository()
}

describe('resolveShortLink - redirección y conteo de clics', () => {
  let repo: LinkRepository

  beforeEach(() => {
    repo = makeRepo()
  })

  it('resuelve un código existente y retorna originalUrl + link, y registra 1 visita', async () => {
    const shortCode = 'abc12345'
    const originalUrl = 'https://example.com/articulo/123'

    await repo.create({
      shortCode,
      shortUrl: `${DEFAULT_BASE_URL}/${shortCode}`,
      originalUrl,
    })

    const result = await resolveShortLink(repo, shortCode)

    expect(result).not.toBeNull()
    expect(result?.originalUrl).toBe(originalUrl)
    expect(result?.link.shortCode).toBe(shortCode)
    expect(result?.link.originalUrl).toBe(originalUrl)
    expect(await repo.countClicks(shortCode)).toBe(1)
  })

  it('incrementa el conteo de visitas en cada resolución exitosa', async () => {
    const shortCode = 'abc12345'
    const originalUrl = 'https://example.com/articulo/123'

    await repo.create({
      shortCode,
      shortUrl: `${DEFAULT_BASE_URL}/${shortCode}`,
      originalUrl,
    })

    await resolveShortLink(repo, shortCode)
    await resolveShortLink(repo, shortCode)

    expect(await repo.countClicks(shortCode)).toBe(2)
  })

  it('retorna null y no registra visita para un código inexistente', async () => {
    const result = await resolveShortLink(repo, 'noexiste')

    expect(result).toBeNull()
    expect(await repo.countClicks('noexiste')).toBe(0)
  })
})
