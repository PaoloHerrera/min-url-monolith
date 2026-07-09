'use client'

import * as React from 'react'
import { Check, Copy, ExternalLink, Link2, LoaderCircle, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

type Status = 'idle' | 'loading' | 'success' | 'error'

export function ToolCard() {
  const [url, setUrl] = React.useState('')
  const [status, setStatus] = React.useState<Status>('idle')
  const [shortUrl, setShortUrl] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState(false)

  const inputRef = React.useRef<HTMLInputElement>(null)
  const copyTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current)
    }
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'loading') return
    setError(null)
    setStatus('loading')
    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string }
        setError(
          data.error === 'invalid_url'
            ? 'URL no válida. Usa un enlace http:// o https://.'
            : 'No se pudo acortar la URL. Inténtalo de nuevo.',
        )
        setStatus('error')
        return
      }
      const data = (await response.json()) as { shortUrl: string }
      setShortUrl(data.shortUrl)
      setStatus('success')
    } catch {
      setError('Error de red. Comprueba tu conexión.')
      setStatus('error')
    }
  }

  async function handleCopy() {
    if (!shortUrl) return
    try {
      await navigator.clipboard?.writeText(shortUrl)
    } catch {
      /* clipboard may be unavailable; ignore */
    }
    setCopied(true)
    if (copyTimer.current) clearTimeout(copyTimer.current)
    copyTimer.current = setTimeout(() => setCopied(false), 2000)
  }

  function handleReset() {
    if (copyTimer.current) clearTimeout(copyTimer.current)
    setUrl('')
    setShortUrl(null)
    setError(null)
    setCopied(false)
    setStatus('idle')
    // Return focus to the input for keyboard / screen-reader users.
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const isInvalid = status === 'error' && Boolean(error)

  return (
    <section aria-label="Acortador de URL" className="relative w-full max-w-xl">
      {/* Glow accent behind the active surface */}
      <div
        aria-hidden="true"
        className="from-primary/20 absolute -inset-1 rounded-2xl bg-linear-to-r to-indigo-500/20 opacity-70 blur-lg transition duration-500"
      />

      {status === 'success' && shortUrl ? (
        <ResultCard shortUrl={shortUrl} copied={copied} onCopy={handleCopy} onReset={handleReset} />
      ) : (
        <Card className="glass-panel relative">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              <label htmlFor="url" className="text-foreground text-sm font-semibold">
                Introduce tu URL larga
              </label>
              <Input
                ref={inputRef}
                id="url"
                name="url"
                type="url"
                inputMode="url"
                autoComplete="url"
                placeholder="https://tu-enlace-largo.com/seccion/articulo..."
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                aria-invalid={isInvalid || undefined}
                aria-describedby={isInvalid ? 'url-error' : undefined}
                disabled={status === 'loading'}
              />
              <Button
                type="submit"
                variant="cta"
                size="lg"
                className="w-full"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? (
                  <>
                    <LoaderCircle data-icon="inline-start" className="animate-spin" />
                    Acortando...
                  </>
                ) : (
                  <>
                    <Link2 data-icon="inline-start" />
                    Acortar
                  </>
                )}
              </Button>
            </form>

            {isInvalid && error ? (
              <p
                id="url-error"
                role="alert"
                className="text-destructive mt-4 flex items-center gap-2 text-sm font-medium"
              >
                <span aria-hidden="true">⚠</span>
                {error}
              </p>
            ) : null}
          </CardContent>
        </Card>
      )}
    </section>
  )
}

function ResultCard({
  shortUrl,
  copied,
  onCopy,
  onReset,
}: {
  shortUrl: string
  copied: boolean
  onCopy: () => void
  onReset: () => void
}) {
  return (
    <Card className="glass-panel animate-card-enter relative">
      <CardContent className="flex flex-col gap-5 p-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
          <span
            aria-hidden="true"
            className="flex size-6 items-center justify-center rounded-full bg-emerald-500/15"
          >
            <Check data-icon className="size-4" />
          </span>
          ¡URL acortada con éxito!
        </div>

        <div
          aria-live="polite"
          className="border-border bg-background/60 rounded-md border px-4 py-3"
        >
          <p className="text-foreground font-mono text-base font-medium break-all">{shortUrl}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="copy"
            size="lg"
            className="flex-1"
            onClick={onCopy}
            aria-label="Copy"
          >
            {copied ? (
              <>
                <Check data-icon="inline-start" />
                Copiado
              </>
            ) : (
              <>
                <Copy data-icon="inline-start" />
                Copy
              </>
            )}
          </Button>

          <Button type="button" variant="cta" size="lg" className="flex-1" asChild>
            <a href={shortUrl} target="_blank" rel="noopener noreferrer" aria-label="Visit">
              <ExternalLink data-icon="inline-start" />
              Visit
            </a>
          </Button>
        </div>

        <Button type="button" variant="ghost" size="lg" className="w-full" onClick={onReset}>
          <RotateCcw data-icon="inline-start" />
          Acortar otra
        </Button>
      </CardContent>
    </Card>
  )
}
