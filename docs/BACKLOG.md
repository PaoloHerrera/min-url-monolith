# Backlog y temas de discusión — Min-URL

Documento general para debatir casos de uso siguientes y decisiones abiertas. No es una especificación formal.

## Casos de uso propuestos (orden sugerido)

1. **Redirección `GET /:shortCode`** (UC-02 — en progreso) — resolver el código a la URL original, redirigir (302) y registrar el clic. Caso de uso natural posterior a "crear". **Decisión de almacenamiento tomada:** el conteo se registra en una tabla `link_visits` separada (modelo event-sourced: `short_code TEXT NOT NULL`, `visited_at TEXT NOT NULL` ISO), NO en una columna `click_count` dentro de `short_links`. El conteo se deriva con `COUNT(*)`. Ver `docs/use-cases/redirect-and-count-clicks.md`.
2. **Rate limiting** — sección 10.2 de REQUISITOS. Ventana fija/deslizante por IP. Fuera del caso 1 por decisión explícita.
3. **Autenticación (Better Auth)** — registro/login, sesión; distinguir links anónimos vs. de usuario.
4. **Alias personalizados** — solo usuarios autenticados; validación de colisiones con códigos auto-generados.
5. **Dashboard y Analytics** — tabla de enlaces, stats de clics, serie temporal.
6. **Observabilidad** — Prometheus `/api/metrics`, logging estructurado (pino), Grafana/Loki.

> **Nota de estado (2026-07-08):** el caso de uso 1 (Crear short URL anónima, UC-01) ya está implementado — ver `docs/use-cases/create-short-url.md` y `spec/changes/add-anonymous-create-short-url/`. El caso 2 (Redirección + conteo de clics, UC-02) está en progreso — ver `docs/use-cases/redirect-and-count-clicks.md` y `spec/changes/add-short-link-redirect/`.

## Decisiones abiertas

- **Driver SQLite (CORREGIDO 2026-07-08):** el código real usa **`bun:sqlite`** + `drizzle-orm/bun-sqlite` (NO `better-sqlite3`). Los scripts `dev`/`build`/`start` en `package.json` usan `bun --bun next ...`, por lo que el runtime de ejecución es **Bun** y el builtin `bun:sqlite` está disponible. `next.config.ts` **no** contiene `serverExternalPackages` (no es necesario para `bun:sqlite`). Por tanto, **no se migra a `better-sqlite3`**; se mantiene `bun:sqlite` tal como está implementado en `src/lib/links/drizzle-repository.ts`. (La entrada anterior que indicaba `better-sqlite3` y descartaba `bun:sqlite` era incorrecta y queda reemplazada por esta.)
- **Base URL de `shortUrl`:** por defecto `http://localhost:3000`; en producción debe venir de `NEXT_PUBLIC_APP_URL`/env. Definir el dominio real (`min-url.dev`).
- **Protección SSRF:** se valida el _host literal_ del input (sin resolución DNS) para no dañar la latencia del laboratorio de estrés. Revisar si se requiere validación más estricta (listas de rangos CIDR, bloqueo de nombres `.local`).
- **Colisión de short code:** reintento en bucle con base62 aleatorio; a escala (K6) conviene medir la tasa de colisión y considerar longitud adaptable.
- **Cliques/analytics:** RESUELTO (UC-02). El conteo se hace en la redirección `GET /:shortCode` y se almacena en una tabla separada `link_visits` (modelo event-sourced), NO en `short_links`. Esto habilita el futuro Dashboard/Analytics de serie temporal (backlog ítem 5). Ver `docs/use-cases/redirect-and-count-clicks.md`.
