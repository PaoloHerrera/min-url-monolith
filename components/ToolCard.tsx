'use client'

import { useState } from 'react'

export function ToolCard() {
  const [url, setUrl] = useState('')
  const [shortUrl, setShortUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setShortUrl(null)
    setLoading(true)
    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string }
        setError(data.error ?? 'No se pudo acortar la URL')
        return
      }
      const data = (await response.json()) as { shortUrl: string }
      setShortUrl(data.shortUrl)
    } catch {
      setError('Error de red')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section aria-label="Acortador de URL" className="glass-panel">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label htmlFor="url" className="text-foreground text-sm font-semibold">
          Introduce tu URL larga
        </label>
        <input
          id="url"
          name="url"
          type="url"
          inputMode="url"
          placeholder="https://tu-enlace-largo.com/seccion/articulo..."
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          className="tool-input"
          disabled={loading}
        />
        <button type="submit" className="tool-btn-submit" disabled={loading}>
          {loading ? 'Acortando...' : 'Acortar'}
        </button>
      </form>

      {error ? (
        <p role="alert" className="mt-4 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      {shortUrl ? (
        <div className="mt-4 flex flex-col gap-3" aria-live="polite">
          <p className="text-foreground font-mono">{shortUrl}</p>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-copy"
              onClick={() => navigator.clipboard?.writeText(shortUrl)}
            >
              Copy
            </button>
            <a href={shortUrl} className="btn-cta" target="_blank" rel="noopener noreferrer">
              Visit
            </a>
          </div>
        </div>
      ) : null}
    </section>
  )
}
