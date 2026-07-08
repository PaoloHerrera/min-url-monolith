import { getLinkRepository } from '@/src/lib/links/repository'
import { createShortLink } from '@/src/lib/links/createShortLink'
import type { LinkRepository, ShortLink } from '@/src/lib/links/repository'

let serverRepoPromise: Promise<LinkRepository> | null = null

function getServerRepository(): Promise<LinkRepository> {
  if (!serverRepoPromise) {
    serverRepoPromise = import('@/src/lib/links/drizzle-repository').then(
      (mod) => new mod.DrizzleLinkRepository(),
    )
  }
  return serverRepoPromise
}

async function resolveRepository(): Promise<LinkRepository> {
  if (process.env.NODE_ENV === 'test') return getLinkRepository()
  return getServerRepository()
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 })
  }

  const url = (body as { url?: unknown })?.url
  if (typeof url !== 'string' || url.trim() === '') {
    return Response.json({ error: 'invalid_url' }, { status: 400 })
  }

  try {
    const repo = await resolveRepository()
    const result: ShortLink = await createShortLink(repo, { url })
    return Response.json(result, { status: 201 })
  } catch (error) {
    if (!(error instanceof Error && error.message.startsWith('invalid_url'))) {
      console.error('createShortLink failed', error)
    }
    return Response.json({ error: 'invalid_url' }, { status: 400 })
  }
}
