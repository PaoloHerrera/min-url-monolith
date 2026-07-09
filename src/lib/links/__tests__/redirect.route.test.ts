import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryLinkRepository } from '@/src/lib/links/repository'
import { setLinkRepository } from '@/src/lib/links/repository'
import { GET } from '@/app/[shortCode]/route'

const DEFAULT_BASE_URL = 'http://localhost:3000'

function makeRepo(): InMemoryLinkRepository {
  return new InMemoryLinkRepository()
}

describe('GET /:shortCode - route handler', () => {
  let repo: InMemoryLinkRepository

  beforeEach(() => {
    repo = makeRepo()
    setLinkRepository(repo)
  })

  it('redirige 302 con Location == originalUrl para un código existente y registra 1 visita', async () => {
    const shortCode = 'abc12345'
    const originalUrl = 'https://example.com/articulo/123'

    await repo.create({
      shortCode,
      shortUrl: `${DEFAULT_BASE_URL}/${shortCode}`,
      originalUrl,
    })

    const res = await GET(new Request(`${DEFAULT_BASE_URL}/${shortCode}`), {
      params: Promise.resolve({ shortCode }),
    })

    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toBe(originalUrl)
    expect(await repo.countClicks(shortCode)).toBe(1)
  })

  it('retorna 404 para un código inexistente', async () => {
    const res = await GET(new Request(`${DEFAULT_BASE_URL}/noexiste123`), {
      params: Promise.resolve({ shortCode: 'noexiste123' }),
    })

    expect(res.status).toBe(404)
  })
})
