# Caso de Uso: Redirección GET /:shortCode y conteo de clics

> **Id del caso de uso:** UC-02  
> **Estado:** Especificado (implementación pendiente, enfoque TDD)  
> **Fuente de verdad:** `docs/REQUISITOS.md`, UC-01 (`docs/use-cases/create-short-url.md`)  
> **Nota de alcance:** Sin nueva UI. El botón "Visit" de `ToolCard` ya enlaza a `shortUrl`.

---

## 1. Resumen

Cuando un visitante navega a `GET /:shortCode`, el sistema resuelve el código a su `originalUrl`, emite una redirección **302** (con un encabezado `Location` absoluto) y **registra el clic** en la tabla de eventos `link_visits`. Si el código no existe, el sistema responde **404** usando la página 404 por defecto de Next.js (sin UI propia para este caso).

## 2. Actor

- **Usuario anónimo / cualquier visitante del short URL** — no requiere sesión ni autenticación. Cualquier persona que abre el enlace corto (incluido el botón "Visit" de `ToolCard`).

## 3. Precondiciones

- El `shortCode` debe existir previamente en `short_links` (generado por UC-01).
- El servicio de base de datos (SQLite vía `bun:sqlite` + Drizzle) debe estar disponible/configurado en el entorno de ejecución.

## 4. Entrada

- Ruta: `GET /:shortCode` con un parámetro de ruta `shortCode` (cadena). No hay cuerpo de petición ni query params relevantes.

## 5. Reglas de negocio

1. **Resolución:** el sistema busca `shortCode` en `short_links`. Si existe, resuelve su `originalUrl`.
2. **Redirección:** respuesta **302** con encabezado `Location` que contiene la `originalUrl` **absoluta** (debe incluir el esquema `http(s)://`).
3. **Registro de clic (event-sourced):** en la misma operación de resolución exitosa, se inserta una fila en la tabla `link_visits` (`short_code`, `visited_at` ISO). El conteo se deriva con `COUNT(*)`; no se usa una columna de conteo dentro de `short_links`.
4. **Código inexistente:** si `findByShortCode` devuelve `null`, no se inserta ningún clic y se responde **404**.
5. **Código con formato no base62:** se trata como un código no encontrado y responde **404** (no se asume válido).
6. **Idempotencia de lookup:** el lookup de `short_links` por código es idempotente; registrar el clic no modifica el link ni su código.

## 6. Flujo principal (paso a paso)

1. El visitante (o el botón "Visit" de `ToolCard`) navega a `GET /:shortCode`.
2. El route handler `app/[shortCode]/route.ts` resuelve el repositorio vía `resolveRepository()` (in-memory cuando `NODE_ENV==='test'`, igual que en UC-01).
3. La función `resolveShortLink(repo, code)` invoca `findByShortCode(code)`.
4. Si el código no existe (`null`), el route responde **404** (página 404 por defecto de Next, sin UI propia).
5. Si existe, `resolveShortLink` invoca `recordVisit(code)` (inserta la visita en `link_visits` y devuelve el `ShortLink`).
6. El route responde **302** con `Location: <originalUrl>` absoluta.
7. El visitante es redirigido al destino original; el clic queda registrado para analytics futuros (backlog ítem 5).

## 7. Escenarios

### 7.1. Positivos

- **SP-1 Redirección exitosa 302 con Location absoluto:** para un `shortCode` existente, la respuesta es `302` y `Location` es la `originalUrl` completa (con `http(s)://`), no una ruta relativa.
- **SP-2 Clic contado:** tras la redirección exitosa, existe una fila en `link_visits` con el `short_code` correcto y un `visited_at` ISO reciente; `countClicks(code)` devuelve al menos `1`.
- **SP-3 Idempotencia de lookup:** repetir `GET /:shortCode` redirige siempre al mismo `originalUrl`; el `shortCode` y la `shortUrl` no cambian entre visitas (cada visita suma una fila, no altera el link).

### 7.2. Negativos

- **SN-1 Código inexistente → 404:** para un `shortCode` que no existe en `short_links`, la respuesta es **404** y **no** se inserta fila alguna en `link_visits`.
- **SN-2 Código con formato no base62 → 404:** un `shortCode` con caracteres fuera del alfabeto base62 (p.ej. `a b/`, `../`, cualquier carácter no alfanumérico del alfabeto base62) se trata como no encontrado y responde **404** sin insertar clic.

## 8. Fuera de alcance (en este caso)

- **Rate limiting** (sección 10.2 de `docs/REQUISITOS.md`) — explícitamente fuera de alcance.
- **Autenticación / autorización** (Better Auth) — el actor es anónimo.
- **Alias personalizados** — no aplica a la resolución/redirección.
- **Dashboard / Analytics de serie temporal** (backlog ítem 5) — solo se sienta la base de datos `link_visits`; no se expone UI ni endpoint de stats en este caso.
- **Observabilidad / Prometheus** (sección 10.1) — sin métricas en este caso.

## 9. Arquitectura propuesta (documentación para alinear tests e implementación)

> Esta sección describe el diseño intencional. **No se implementa aquí**; sirve de contrato para TDD.

### 9.1. Schema — `src/lib/links/schema.ts`

- Añadir tabla Drizzle `linkVisits` (**sin tocar `short_links`**):
  - `id INTEGER PRIMARY KEY AUTOINCREMENT`
  - `shortCode TEXT NOT NULL` (columna `short_code`)
  - `visitedAt TEXT NOT NULL` (columna `visited_at`, ISO timestamp)

### 9.2. Repositorio — `src/lib/links/repository.ts`

Interfaz `LinkRepository` (**async**) — se añaden dos métodos a los existentes:

```ts
interface LinkRepository {
  findByOriginalUrl(originalUrl: string): Promise<ShortLink | null>
  findByShortCode(shortCode: string): Promise<ShortLink | null>
  create(data: Omit<ShortLink, 'createdAt'>): Promise<ShortLink>
  // --- nuevos en UC-02 ---
  recordVisit(shortCode: string): Promise<ShortLink | null>
  countClicks(shortCode: string): Promise<number>
}
```

- `recordVisit(shortCode)`: si el código existe, inserta una visita en `link_visits` y devuelve el `ShortLink`; si no existe, devuelve `null` (sin insertar).
- `countClicks(shortCode)`: devuelve `SELECT COUNT(*) FROM link_visits WHERE short_code = ?`.

### 9.3. Implementación en memoria — `src/lib/links/in-memory-repository.ts`

- Añadir un mapa de visitas por código (p.ej. `Map<string, string[]>` de timestamps ISO, o contador `Map<string, number>`).
- `recordVisit`: lookup en `byCode`; si no existe devuelve `null`; si existe incrementa el contador/fila y devuelve el `ShortLink`.
- `countClicks`: devuelve el tamaño/suma asociada al código.

### 9.4. Implementación Drizzle — `src/lib/links/drizzle-repository.ts`

- En el constructor, `CREATE TABLE IF NOT EXISTS link_visits (...)` **idempotente** (junto al existente `short_links`).
- `recordVisit(shortCode)`: `findByShortCode`; si `null` → `null`; si existe → `INSERT` en `link_visits` (`short_code`, `visited_at`) y devuelve el link.
- `countClicks(shortCode)`: `SELECT COUNT(*) FROM link_visits WHERE short_code = ?`.
- **Driver:** se mantiene `bun:sqlite` vía `drizzle-orm/bun-sqlite` (runtime Bun, `bun --bun`). **No** migrar a `better-sqlite3`.

### 9.5. Resolución pura — `src/lib/links/resolveShortLink.ts`

- `resolveShortLink(repo: LinkRepository, code: string)`: función pura y testeable (repo inyectado).
  - `findByShortCode(code)` → si `null` retorna `null` (sin insertar clic).
  - si existe → `recordVisit(code)` y retorna `{ originalUrl, link }`.

### 9.6. Route handler — `app/[shortCode]/route.ts`

- `GET` handler que reusa el patrón `resolveRepository()` de `app/api/links/route.ts` (in-memory cuando `NODE_ENV==='test'`).
- Éxito: responde `302` con `Location` = `originalUrl` absoluta.
- `null`: responde **404** (página 404 por defecto de Next, sin UI propia).

### 9.7. Tests

- **Vitest (unit):** `resolveShortLink` (código inexistente → `null`; existe → `{ originalUrl, link }` y visita registrada); `recordVisit`/`countClicks` en `InMemoryLinkRepository`.
- **Vitest (integration / route):** `GET /:shortCode` → `302` + `Location` absoluto para código existente; `404` para inexistente; verificación de fila en `link_visits` (vía `countClicks`) usando `setLinkRepository` en `NODE_ENV==='test'`.
- **Playwright E2E:** el botón "Visit" de `ToolCard` abre el short URL y el navegador es redirigido a la `originalUrl` (comprobando la URL final); el clic queda registrado (verificable vía estado interno o `countClicks`).
