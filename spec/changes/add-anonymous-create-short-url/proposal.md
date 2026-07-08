# Proposal: Add Anonymous Create Short URL

**Status:** Proposed
**Parent spec:** `short-link`
**Related docs:** `docs/use-cases/create-short-url.md`, `docs/REQUISITOS.md` (sections 4.1, 5.1, 8.1)

## Why

Min-URL necesita, como primer caso de uso y base del laboratorio de estrés, permitir a **cualquier visitante anónimo** acortar una URL sin autenticación. Hoy el repo solo contiene el esqueleto de Next.js 16 + Bun sin lógica de negocio ni persistencia. Sin esta capacidad, no hay ningún endpoint real que someter a pruebas de carga (K6) ni una landing funcional según `docs/REQUISITOS.md` (sección 4.1). El enfoque es TDD: primero se especifica el comportamiento (este proposal + spec delta + caso de uso) y luego se implementa guiado por tests.

## What Changes

- Se añade la capa de dominio `src/lib/links/` con tipos, validación (http/https + protección SSRF), generación de `shortCode` base62 (8 chars) e inyectable, y la función orquestadora pura `createShortLink`.
- Se añaden dos implementaciones de `LinkRepository`: `in-memory-repository` (tests) y `drizzle-repository` + schema `short_links` (SQLite vía `better-sqlite3`) para producción.
- Se añade el endpoint `POST /api/links` que devuelve `201` + JSON o `400` en error tipado.
- Se añade `components/ToolCard.tsx` y se actualiza `app/page.tsx` para exponer la tool card accesible (Copy/Visit/Shorten another, error inline vía `aria-describedby`).
- Se cubre con tests unitarios (Vitest) del servicio y del repositorio en memoria, y tests de componente (Testing Library) de la tool card.
- Se documenta el caso de uso en `docs/use-cases/create-short-url.md`.

**Reglas de negocio incluidas:** validación http/https, bloqueo SSRF (localhost/privadas), idempotencia por `originalUrl`, `shortCode` base62 de 8 chars con reintento ante colisión, salida `{ shortCode, shortUrl, originalUrl, createdAt }`.

**Fuera de alcance (explícito):** rate limiting (sección 10.2 de `docs/REQUISITOS.md`), autenticación, alias personalizados, analytics/conteo de clics, observabilidad/Prometheus, y la redirección `GET /:code` (caso de uso 2).

## Impact

- **Archivos nuevos:** `src/lib/links/*`, `app/api/links/route.ts`, `components/ToolCard.tsx`, `docs/use-cases/create-short-url.md`, y los specs en `spec/changes/add-anonymous-create-short-url/`.
- **Dependencias:** se introducen `better-sqlite3` + `drizzle-orm` + `drizzle-kit` (y su config) para la implementación de producción; `vitest` + `@testing-library/react` para tests (coherente con sección 2.1 de `docs/REQUISITOS.md`).
- **Schema de BD:** nueva tabla `short_links` (snake_case, ver Apéndice A de `docs/REQUISITOS.md`).
- **Riesgos:** la protección SSRF debe considerar solo el _host_ literal del input (no resolución DNS) para mantener latencia baja en el laboratorio; validación estricta para no abrir vectores de SSRF.
- **Sin breaking changes:** no altera rutas ni componentes existentes; es funcionalidad aditiva.
