import Link from 'next/link'
import { GitFork, Link2 } from 'lucide-react'

import { ThemeToggle } from '@/components/ThemeToggle'

const GITHUB_URL = 'https://github.com/'

export function Navbar() {
  return (
    <header className="border-border/60 bg-background/70 fixed inset-x-0 top-0 z-50 border-b backdrop-blur-md">
      <nav
        aria-label="Principal"
        className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6"
      >
        <Link
          href="/"
          className="focus-visible:ring-ring focus-visible:ring-offset-background flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          <span className="bg-primary/15 text-primary flex size-8 items-center justify-center rounded-md">
            <Link2 data-icon className="size-5" />
          </span>
          <span className="text-foreground text-base font-bold tracking-tight">Min-URL</span>
        </Link>

        <div className="flex items-center gap-1">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Repositorio en GitHub"
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-background flex size-11 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            <GitFork data-icon className="size-5" />
          </a>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
