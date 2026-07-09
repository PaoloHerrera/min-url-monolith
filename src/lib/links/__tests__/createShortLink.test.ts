import { describe, it, expect, vi, beforeEach } from 'vitest'
import { InMemoryLinkRepository, type LinkRepository } from '@/src/lib/links/repository'
import { createShortLink } from '@/src/lib/links/createShortLink'

const BASE62 = /^[0-9a-zA-Z]{8}$/
const DEFAULT_BASE_URL = 'http://localhost:3000'

function makeRepo(): LinkRepository {
  return new InMemoryLinkRepository()
}

describe('createShortLink - happy path', () => {
  let repo: LinkRepository

  beforeEach(() => {
    repo = makeRepo()
  })

  it('creates a short link for a valid http url with an 8-char base62 code', async () => {
    const result = await createShortLink(repo, { url: 'http://example.com/articulos/123' })

    expect(result.shortCode).toMatch(BASE62)
    expect(result.shortUrl).toBe(`${DEFAULT_BASE_URL}/${result.shortCode}`)
    expect(result.originalUrl).toBe('http://example.com/articulos/123')
    expect(result.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('creates a short link for a valid https url', async () => {
    const result = await createShortLink(repo, { url: 'https://example.com/ruta?q=1' })

    expect(result.shortCode).toMatch(BASE62)
    expect(result.originalUrl).toBe('https://example.com/ruta?q=1')
  })

  it('uses the injected baseUrl to build the shortUrl', async () => {
    const result = await createShortLink(
      repo,
      { url: 'https://example.com/x' },
      { baseUrl: 'https://s.min-url.test' },
    )

    expect(result.shortUrl).toBe(`https://s.min-url.test/${result.shortCode}`)
  })

  it('persists the created link in the repository', async () => {
    const result = await createShortLink(repo, { url: 'https://example.com/x' })

    const stored = await repo.findByShortCode(result.shortCode)
    expect(stored).not.toBeNull()
    expect(stored?.originalUrl).toBe('https://example.com/x')
  })
})

describe('createShortLink - idempotency', () => {
  it('returns the same short link when the original url already exists', async () => {
    const repo = makeRepo()
    const first = await createShortLink(repo, { url: 'https://example.com/repeated' })
    const second = await createShortLink(repo, { url: 'https://example.com/repeated' })

    expect(second.shortCode).toBe(first.shortCode)
    expect(second.shortUrl).toBe(first.shortUrl)

    const all = await repo.findByOriginalUrl('https://example.com/repeated')
    expect(all).not.toBeNull()
    // only one record stored for this original url
    const count = (await repo.findByShortCode(first.shortCode)) ? 1 : 0
    expect(count).toBe(1)
  })
})

describe('createShortLink - validation errors', () => {
  let repo: LinkRepository

  beforeEach(() => {
    repo = makeRepo()
  })

  it('rejects an empty url', async () => {
    await expect(createShortLink(repo, { url: '' })).rejects.toThrow()
  })

  it('rejects a non-parseable string', async () => {
    await expect(createShortLink(repo, { url: 'no-es-una-url' })).rejects.toThrow()
  })

  it('rejects a non-http(s) scheme (ftp)', async () => {
    await expect(createShortLink(repo, { url: 'ftp://example.com/file' })).rejects.toThrow()
  })

  it('rejects a non-http(s) scheme (javascript)', async () => {
    await expect(createShortLink(repo, { url: 'javascript:alert(1)' })).rejects.toThrow()
  })

  it('rejects localhost', async () => {
    await expect(createShortLink(repo, { url: 'http://localhost:3000/admin' })).rejects.toThrow()
  })

  it('rejects the loopback ip 127.0.0.1', async () => {
    await expect(createShortLink(repo, { url: 'http://127.0.0.1/' })).rejects.toThrow()
  })

  it('rejects the ipv6 loopback ::1', async () => {
    await expect(createShortLink(repo, { url: 'http://[::1]/' })).rejects.toThrow()
  })

  it('rejects a 10.x private ip', async () => {
    await expect(createShortLink(repo, { url: 'http://10.0.0.1/' })).rejects.toThrow()
  })

  it('rejects a 192.168.x private ip', async () => {
    await expect(createShortLink(repo, { url: 'http://192.168.1.1/' })).rejects.toThrow()
  })

  it('rejects a 172.16.x private ip', async () => {
    await expect(createShortLink(repo, { url: 'http://172.16.5.4/' })).rejects.toThrow()
  })
})

describe('createShortLink - short code collision', () => {
  it('regenerates a free code when the generated one collides (no infinite loop)', async () => {
    const repo = makeRepo()
    // Pre-seed the repository with an existing link using the colliding code.
    await repo.create({
      shortCode: 'AAAAAAAA',
      shortUrl: `${DEFAULT_BASE_URL}/AAAAAAAA`,
      originalUrl: 'https://existing.example.com',
    })

    // Generator forces a collision on the first call, then yields a free code.
    const generateCode = vi
      .fn(() => 'AAAAAAAA')
      .mockImplementationOnce(() => 'AAAAAAAA')
      .mockImplementationOnce(() => 'BBBBBBBB')

    const result = await createShortLink(
      repo,
      { url: 'https://collide.example.com' },
      { generateCode },
    )

    expect(generateCode).toHaveBeenCalledTimes(2)
    expect(result.shortCode).toBe('BBBBBBBB')
    expect(result.shortCode).toMatch(BASE62)
    expect(await repo.findByShortCode('BBBBBBBB')).not.toBeNull()
    // the previously existing record is untouched
    expect(await repo.findByShortCode('AAAAAAAA')).not.toBeNull()
  })
})
