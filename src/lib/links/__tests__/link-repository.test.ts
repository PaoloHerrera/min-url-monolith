import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryLinkRepository } from '@/src/lib/links/repository'

const DEFAULT_BASE_URL = 'http://localhost:3000'

function makeRepo(): InMemoryLinkRepository {
  return new InMemoryLinkRepository()
}

describe('InMemoryLinkRepository - recordVisit y countClicks (UC-02)', () => {
  let repo: InMemoryLinkRepository

  beforeEach(() => {
    repo = makeRepo()
  })

  it('countClicks arranca en 0 para cualquier código', async () => {
    expect(await repo.countClicks('cualquier-codigo')).toBe(0)
  })

  it('recordVisit sobre un link existente retorna el link y countClicks pasa de 0 a 1', async () => {
    const shortCode = 'abc12345'
    const originalUrl = 'https://example.com/articulo/123'

    const creado = await repo.create({
      shortCode,
      shortUrl: `${DEFAULT_BASE_URL}/${shortCode}`,
      originalUrl,
    })

    expect(await repo.countClicks(shortCode)).toBe(0)

    const resultado = await repo.recordVisit(shortCode)

    expect(resultado).not.toBeNull()
    expect(resultado?.shortCode).toBe(creado.shortCode)
    expect(resultado?.originalUrl).toBe(originalUrl)
    expect(await repo.countClicks(shortCode)).toBe(1)
  })

  it('recordVisit sobre un código inexistente retorna null y countClicks queda en 0', async () => {
    const resultado = await repo.recordVisit('inexistente')

    expect(resultado).toBeNull()
    expect(await repo.countClicks('inexistente')).toBe(0)
  })

  it('countClicks refleja múltiples visitas acumuladas', async () => {
    const shortCode = 'abc12345'

    await repo.create({
      shortCode,
      shortUrl: `${DEFAULT_BASE_URL}/${shortCode}`,
      originalUrl: 'https://example.com/articulo/123',
    })

    await repo.recordVisit(shortCode)
    await repo.recordVisit(shortCode)
    await repo.recordVisit(shortCode)

    expect(await repo.countClicks(shortCode)).toBe(3)
  })
})
