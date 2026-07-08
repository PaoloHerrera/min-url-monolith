import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryLinkRepository } from '@/src/lib/links/repository'
import { setLinkRepository } from '@/src/lib/links/repository'
import { POST } from '@/app/api/links/route'

function makeRequest(url: string) {
  return new Request('http://localhost:3000/api/links', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ url }),
  })
}

describe('POST /api/links', () => {
  beforeEach(() => {
    setLinkRepository(new InMemoryLinkRepository())
  })

  it('returns 201 with the short link payload for a valid url', async () => {
    const response = await POST(makeRequest('https://example.com/articulos/123'))
    const body = await response.json()

    expect(response.status).toBe(201)
    expect(body.shortCode).toMatch(/^[0-9a-zA-Z]{8}$/)
    expect(body.shortUrl).toBe(`http://localhost:3000/${body.shortCode}`)
    expect(body.originalUrl).toBe('https://example.com/articulos/123')
    expect(typeof body.createdAt).toBe('string')
  })

  it('returns 400 with an error body for an ftp url', async () => {
    const response = await POST(makeRequest('ftp://example.com/file'))
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBeTruthy()
  })

  it('returns 400 with an error body for an empty url', async () => {
    const response = await POST(makeRequest(''))
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBeTruthy()
  })
})
