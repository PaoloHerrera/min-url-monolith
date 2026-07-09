export function Footer() {
  return (
    <footer className="border-border/60 mt-20 w-full border-t px-4 py-8 text-center sm:px-6">
      <div className="text-muted-foreground mx-auto flex flex-col items-center gap-2 text-xs">
        <p>© {new Date().getFullYear()} Min-URL Monolith • Built with Next.js 16 &amp; Bun</p>
        <span className="border-border/60 rounded-full border px-2 py-0.5 font-mono text-[11px]">
          v0.2.0-stable
        </span>
      </div>
    </footer>
  )
}
