# Proposal: Add Short Link Redirect and Click Count

**Status:** Proposed
**Parent spec:** `short-link`
**Related docs:** `docs/use-cases/redirect-and-count-clicks.md`, `docs/use-cases/create-short-url.md`, `docs/REQUISITOS.md`

## Why

Min-URL necesita, como caso de uso natural posterior a "crear short URL" (UC-01, ya implementado), redirigir los enlaces cortos a su destino original y registrar los clics para habilitar analytics futuros. Hoy el repo resuelve la creación (UC-01) pero no la redirección: navegar a `GET /:shortCode` no resuelve nada ni cuenta clics. Sin esta capacidad, los short URLs generados no son utilizables y el laboratorio de estrés (K6) no puede ejercitar el camino de lectura/redirección. El enfoque es TDD: primero se especifica el comportamiento (este proposal + spec delta + caso de uso) y luego se implementa guiado por tests.

## What Changes

- Se añade la tabla Drizzle `linkVisits` en `src/lib/links/schema.ts` (id autoincrement, `short_code` TEXT NOT NULL, `visited_at` TEXT NOT NULL ISO), **sin modificar** `short_links`.
- Se extiende la interfaz `LinkRepository` (`src/lib/links/repository.ts`) con `recordVisit(shortCode): Promise<ShortLink | null>` y `countClicks(shortCode): Promise<number>`.
- Se implementan ambos métodos en `src/lib/links/in-memory-repository.ts` (mapa de visitas por código) para tests rápidos sin BD.
- Se actualiza `src/lib/links/drizzle-repository.ts`: `CREATE TABLE IF NOT EXISTS link_visits (...)` idempotente en el constructor; `recordVisit` hace lookup y, si existe, inserta y devuelve el link; `countClicks` hace `SELECT COUNT(*) FROM link_visits WHERE short_code = ?`. Se mantiene el driver `bun:sqlite`.
- Se añade `src/lib/links/resolveShortLink.ts`: función pura (repo inyectado) que hace `findByShortCode` → `null` retorna `null` (sin insertar); si existe, `recordVisit` y retorna `{ originalUrl, link }`.
- Se añade `app/[shortCode]/route.ts` (handler `GET`) que reusa `resolveRepository()` de UC-01 (in-memory en `NODE_ENV==='test'`); responde `302` + `Location` absoluta en éxito, o `404` en código no encontrado.
- Se cubre con tests unitarios (Vitest) de `resolveShortLink` y del repositorio en memoria, tests de integración del route, y un test E2E (Playwright) del botón "Visit" de `ToolCard`.
- Se documenta el caso de uso en `docs/use-cases/redirect-and-count-clicks.md`.

**Decisiones registradas:**

- **Almacenamiento de clics (event-sourced):** se usa una tabla `link_visits` separada, NO una columna `click_count` en `short_links`. El conteo se deriva con `COUNT(*)`. Esto habilita el futuro Dashboard/Analytics de serie temporal (backlog ítem 5).
- **Driver de BD:** se mantiene **`bun:sqlite`** (runtime Bun vía `bun --bun`). NO se migra a `better-sqlite3`.

**Reglas de negocio incluidas:** redirección 302 con `Location` absoluto; registro de clic en `link_visits` solo si el código existe; 404 (página por defecto de Next) para código inexistente o con formato no base62; sin UI propia para el 404.

**Fuera de alcance (explícito):** rate limiting (sección 10.2 de `docs/REQUISITOS.md`), autenticación, alias personalizados, dashboard/analytics de serie temporal (solo se sienta la base `link_visits`), observabilidad/Prometheus.

## Impact

- **Archivos nuevos:** `src/lib/links/resolveShortLink.ts`, `app/[shortCode]/route.ts`, `docs/use-cases/redirect-and-count-clicks.md`, y los specs en `spec/changes/add-short-link-redirect/`.
- **Archivos modificados:** `src/lib/links/schema.ts` (tabla `linkVisits`), `src/lib/links/repository.ts` (interfaz), `src/lib/links/in-memory-repository.ts` (métodos), `src/lib/links/drizzle-repository.ts` (tabla + métodos).
- **Dependencias:** ninguna nueva. `bun:sqlite` + `drizzle-orm` ya están presentes; los scripts siguen usando `bun --bun`. No se introduce `better-sqlite3`.
- **Schema de BD:** nueva tabla `link_visits` (junto a `short_links`); sin alterar `short_links`.
- **Riesgos:** el registro del clic no debe penalizar la latencia de la redirección (inserción ligera, relevante para el laboratorio de estrés); un código con formato no base62 o inexistente debe caer en 404 sin tocar `link_visits`.
- **Sin breaking changes:** es funcionalidad aditiva; no altera `POST /api/links` ni la UI existente.
