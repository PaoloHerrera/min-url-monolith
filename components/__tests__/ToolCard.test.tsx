import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToolCard } from '@/components/ToolCard'

const SAMPLE_SHORT_URL = 'http://localhost:3000/AbCdEf12'

describe('<ToolCard />', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders an accessible url input and an Acortar button', () => {
    render(<ToolCard />)

    expect(screen.getByRole('textbox', { name: /url/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /acortar/i })).toBeInTheDocument()
  })

  it('shows the short url with Copy and Visit actions on success', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              shortCode: 'AbCdEf12',
              shortUrl: SAMPLE_SHORT_URL,
              originalUrl: 'https://example.com/x',
              createdAt: new Date().toISOString(),
            }),
            {
              status: 201,
              headers: { 'content-type': 'application/json' },
            },
          ),
      ),
    )

    render(<ToolCard />)

    const input = screen.getByRole('textbox', { name: /url/i })
    await user.type(input, 'https://example.com/x')
    await user.click(screen.getByRole('button', { name: /acortar/i }))

    expect(await screen.findByText(SAMPLE_SHORT_URL)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /visit/i })).toBeInTheDocument()
  })

  it('shows an inline error with role="alert" when the endpoint returns 400', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ error: 'invalid_url' }), {
            status: 400,
            headers: { 'content-type': 'application/json' },
          }),
      ),
    )

    render(<ToolCard />)

    const input = screen.getByRole('textbox', { name: /url/i })
    await user.type(input, 'ftp://example.com/file')
    await user.click(screen.getByRole('button', { name: /acortar/i }))

    const alert = await screen.findByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(alert.textContent).toBeTruthy()
  })
})
