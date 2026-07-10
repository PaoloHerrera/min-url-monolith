# Backlog y temas de discusión — Min-URL

Documento general para debatir casos de uso siguientes y decisiones abiertas. No es una especificación formal.

> **Alcance actual del laboratorio:** solo **UC-01 (crear short URL anónima)** y **UC-02 (redirigir `GET /:shortCode` 302 + contar clics en `link_visits`)**. Autenticación (UC-03), Dashboard, Analytics y alias personalizados están **fuera de alcance**. La observabilidad (Prometheus/Loki/K6/Docker) es el norte del laboratorio pero se implementa en una fase **posterior a la UX/UI**.

## Estado por caso de uso

| Caso de uso                          | Estado                             |
| ------------------------------------ | ---------------------------------- |
| **UC-01 — Crear short URL anónima**  | ✅ **Implementado y retenido**     |
| **UC-02 — Redirigir + contar clics** | ✅ **Implementado y retenido**     |
| Observabilidad (§10 REQUISITOS)      | ⏳ **Pendiente** (fase post-UX/UI) |
| Rate limiting (§10.2 REQUISITOS)     | 🔲 **Opcional / lab**              |
| Auth / Dashboard / Analytics         | ❌ **Fuera de alcance**            |

## Siguientes pasos (orden sugerido)

1. **Pulido UX/UI de la landing (NEXT)** — la próxima fase se centra en dejar la landing completa y pulida, usando **React directo + shadcn/ui** (no OpenPencil). Componentes a pulir:
   - **Hero** — badge, título gradiente, tagline, glows y background grid (ya presentes en `app/page.tsx`, se conservan y refinan).
   - **ToolCard** (`components/ToolCard.tsx`) — estados completos de input/button (normal, hover, focus, loading, error, success) según §5.1–5.2 de REQUISITOS; feedback accesible (Copy / Visit / Shorten another) con `aria-live`.
   - **Navbar mínimo** (opcional) — logo + toggle dark/light; sin login/register.
   - **Footer** — minimal (copyright + versión).
   - **Toggle dark/light** funcional persistente (cookie + `localStorage`).
   - **Responsive** (mobile/tablet/desktop) y **accesibilidad** (skip link, landmarks, focus-visible, reduced motion) según §6–§8 de REQUISITOS.
2. **Observabilidad (LATER, post-UX)** — capa de infraestructura del laboratorio:
   - **Prometheus:** endpoint `/api/metrics` con métricas HTTP, histogramas de latencia y event-loop lag (§10.1).
   - **Logging:** `pino` (JSON) + ingestión en **Loki** para Grafana (§10.1).
   - **K6:** scripts en `/k6/` (`smoke.js`, `load.js`, `stress.js`, `spike.js`, `soak.js`) (§10.4).
   - **Docker:** `docker-compose` con servicios `app` / `prometheus` / `grafana` / `loki` (§10.3, §10.5).
3. **Rate limiting (OPTIONAL)** — ventana fija/deslizante por IP (§10.2). Fuera del caso 1 por decisión explícita.

## Fuera de alcance (laboratorio actual)

- **Autenticación / UC-03 (Better Auth)** — eliminada; el actor es siempre anónimo.
- **Alias personalizados** — el `shortCode` es siempre generado (base62 de 8 chars), no elegido por el usuario.
- **Dashboard** (`/dashboard`) — tabla de enlaces, acciones por fila.
- **Analytics** (`/dashboard/[linkId]`) — stats cards, gráfico de serie temporal, side panel.
- El código y la documentación de UC-03 fueron removidos del repositorio.

## Decisiones abiertas

- **Driver SQLite (CORREGIDO 2026-07-08):** el código real usa **`bun:sqlite`** + `drizzle-orm/bun-sqlite` (NO `better-sqlite3`). Los scripts `dev`/`build`/`start` en `package.json` usan `bun --bun next ...`, por lo que el runtime de ejecución es **Bun** y el builtin `bun:sqlite` está disponible. `next.config.ts` **no** contiene `serverExternalPackages` (no es necesario para `bun:sqlite`). Por tanto, **no se migra a `better-sqlite3`**; se mantiene `bun:sqlite` tal como está implementado en `src/lib/links/drizzle-repository.ts`. (La entrada anterior que indicaba `better-sqlite3` y descartaba `bun:sqlite` era incorrecta y queda reemplazada por esta.)
- **Base URL de `shortUrl`:** por defecto `http://localhost:3000`; en producción debe venir de `NEXT_PUBLIC_APP_URL`/env. Definir el dominio real (`min-url.dev`).
- **Protección SSRF:** se valida el _host literal_ del input (sin resolución DNS) para no dañar la latencia del laboratorio de estrés. Revisar si se requiere validación más estricta (listas de rangos CIDR, bloqueo de nombres `.local`).
- **Colisión de short code:** reintento en bucle con base62 aleatorio; a escala (K6) conviene medir la tasa de colisión y considerar longitud adaptable.
- **Cliques/analytics:** RESUELTO (UC-02). El conteo se hace en la redirección `GET /:shortCode` y se almacena en una tabla separada `link_visits` (modelo event-sourced), NO en `short_links`. Esto sienta la base de datos para una futura fase de observabilidad de series temporales.
