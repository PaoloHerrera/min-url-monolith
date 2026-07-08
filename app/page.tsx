import { ToolCard } from '@/components/ToolCard'

export default function Home() {
  return (
    <main className="bg-background flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-16">
      <header className="text-center">
        <h1 className="text-foreground text-4xl font-bold sm:text-5xl">
          Acorta. Comparte. Analiza.
        </h1>
        <p className="mt-3 text-(--text-secondary)">
          URLs cortas con analíticas en tiempo real, en un solo monolito.
        </p>
      </header>

      <div className="w-full max-w-xl">
        <ToolCard />
      </div>

      <footer className="mt-8 text-sm text-(--text-muted)">© 2026 Min-URL</footer>
    </main>
  )
}
