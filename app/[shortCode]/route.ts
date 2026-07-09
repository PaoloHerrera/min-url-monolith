import { getLinkRepository } from '@/src/lib/links/repository'
import { resolveShortLink } from '@/src/lib/links/resolveShortLink'
import type { LinkRepository } from '@/src/lib/links/repository'

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

export async function GET(
  _request: Request,
  context: { params: Promise<{ shortCode: string }> },
): Promise<Response> {
  const { shortCode } = await context.params

  const repo = await resolveRepository()
  const resolved = await resolveShortLink(repo, shortCode)
  if (!resolved) {
    return new Response(null, { status: 404 })
  }

  return Response.redirect(resolved.originalUrl, 302)
}
