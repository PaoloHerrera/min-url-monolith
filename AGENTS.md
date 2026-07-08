<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Min-URL Monolith

A URL shortener monolith — stress-test lab comparing monolithic vs. distributed architecture. Built with Next.js 16 App Router.

## Quick start

```bash
bun install          # dependencies
bun run dev          # dev server at http://localhost:3000
bun run build        # production build
bun run start        # start production server
```

## Commands

| Command                | What it does               |
| ---------------------- | -------------------------- |
| `bun run dev`          | dev server                 |
| `bun run build`        | production build           |
| `bun run start`        | start production server    |
| `bun run lint`         | ESLint (flat config)       |
| `bun run format`       | Prettier write all         |
| `bun run format:check` | Prettier check only        |
| `bun run test`         | no tests yet (placeholder) |

**Commit order:** `bun run lint` → commit (lint-staged auto-fixes staged files; commitlint enforces conventional commits).

## Stack

- **Runtime:** Bun 1.3.14 (not Node). Docker uses `oven/bun:1.3.14-alpine`.
- **Framework:** Next.js 16.2.10 (App Router). Docs bundled at `node_modules/next/dist/docs/`.
- **Styling:** Tailwind CSS v4 (CSS-based config via `@tailwindcss/postcss`, no `tailwind.config.*`). Globals in `app/globals.css` with `@theme inline`.
- **Lint/Format:** ESLint flat config (`eslint.config.mjs`) — `eslint-config-next/core-web-vitals` + typescript + `eslint-config-prettier`. Prettier: 100 width, no semi, single quotes, trailing commas, LF.
- **Git hooks:** Husky — pre-commit runs `bunx lint-staged`, commit-msg runs `commitlint`, pre-push runs `bun run test`.
- **TypeScript:** Strict mode. Path alias `@/*` → `./*`.
- **Docker:** Multi-stage build (`Dockerfile`). Compose at `docker-compose.yml` — mounts `./data:/app/data` for SQLite persistence.

## Architecture

- **Entrypoint:** `app/layout.tsx` (root layout) + `app/page.tsx` (landing page).
- **Auth:** Better Auth (email/password + Google OAuth) — planned, not yet installed.
- **Database:** SQLite via `better-sqlite3` + Drizzle ORM — planned, not yet installed.
- **Design tokens:** CSS custom properties defined in `docs/REQUISITOS.md` (dark mode default, light via `.light` class). Reusable glass/button classes documented there.
- **Pending directories** (per implementation plan): `src/`, `components/`, `k6/` (load testing).
- **Pencil design files:** `designs/*.pen` — access only via `pencil` MCP tools.

## Naming conventions

| Type                | Convention     | Example              |
| ------------------- | -------------- | -------------------- |
| React components    | PascalCase     | `GlassPanel.tsx`     |
| Util functions      | camelCase      | `formatDate.ts`      |
| Drizzle schemas     | snake_case     | `short_links`        |
| Next.js route files | kebab-case     | `create-link.tsx`    |
| Config files        | kebab-case     | `docker-compose.yml` |
| CSS variables       | `--kebab-case` | `--bg-card`          |

## Design system (from `docs/REQUISITOS.md`)

Dark mode default. Brand accent: `#0056FF`. Reusable classes: `glass-panel`, `glass-panel-hover`, `btn-cta`, `btn-copy`, `tool-input`, `tool-btn-submit`, `tool-btn-ghost`. All states (hover, focus, active, disabled, loading, error, success) must be implemented per section 5 of the requirements doc.
