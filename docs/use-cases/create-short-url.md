# Caso de Uso: Crear short URL anónima

> **Id del caso de uso:** UC-01  
> **Estado:** Implementado y retenido  
> **Fuente de verdad:** `docs/REQUISITOS.md` (secciones 4.1 Landing, 5.1 Input, 8.1 Accesibilidad)  
> **Nota de alcance:** El rate limiting de la sección 10.2 de `docs/REQUISITOS.md` queda **FUERA** de este caso de uso.

---

## 1. Resumen

Permite a cualquier visitante acortar una URL larga **sin iniciar sesión**, obteniendo una short URL de 8 caracteres base62. El caso cubre tanto el backend (servicio + endpoint `POST /api/links`) como la UI (tool card en la landing que consume el endpoint y muestra la short URL con acciones Copy/Visit y errores inline accesibles).

## 2. Actor

- **Usuario anónimo** — sin sesión, sin autenticación, sin cuenta. Cualquier visitante de la landing (`/`).

## 3. Precondiciones

- Ninguna. El flujo debe funcionar **sin login**.
- El servicio de base de datos (SQLite vía `bun:sqlite` + Drizzle) debe estar disponible/configurado en el entorno de ejecución.

## 4. Entrada

- Una URL larga (string) enviada por el usuario. Más adelante vía `POST` al endpoint y, en la UI, a través de la tool card de la landing.
- Campo de entrada: `url` (string).

## 5. Reglas de negocio

1. **Validación de formato:** la URL debe usar esquema `http://` o `https://` y estar bien formada (parseable por el API de URL del runtime). Se rechazan esquemas distintos (`ftp://`, `javascript:`, `data:`, etc.) y cadenas no parseables.
2. **Protección SSRF:** se rechazan destinos que resuelvan a `localhost`, `127.0.0.1`, `::1` y rangos de IP privadas (`10.0.0.0/8`, `192.168.0.0/16`, `172.16.0.0–172.31.255.255`).
3. **Idempotencia:** si la misma URL larga ya fue acortada, se devuelve la **misma** short URL existente (no se crea un duplicado).
4. **Short code:** base62 aleatorio, largo fijo de **8 caracteres**; ante colisión de código se regenera hasta obtener uno libre.
5. **Salida:** un objeto con `{ shortCode, shortUrl, originalUrl, createdAt }`.

## 6. Flujo principal (paso a paso)

1. El usuario anónimo introduce una URL larga en la tool card de la landing (`/`).
2. La UI envía `POST /api/links` con `{ "url": "<url larga>" }`.
3. El endpoint valida el cuerpo de la petición.
4. El servicio `createShortLink` valida la URL (formato + protección SSRF).
5. El servicio busca una short URL existente para esa `originalUrl` (idempotencia).
   - **5a.** Si existe, devuelve el registro existente.
   - **5b.** Si no existe, genera un `shortCode` base62 de 8 caracteres, verifica que esté libre (reintenta ante colisión) y crea el registro.
6. El endpoint responde `201 Created` con el JSON `{ shortCode, shortUrl, originalUrl, createdAt }`.
7. La UI muestra el estado de éxito con las acciones **Copy**, **Visit** y **Shorten another** (este último resetea el formulario, ver sección 4.1 de `docs/REQUISITOS.md`).

## 7. Escenarios

### 7.1. Positivos

- **SP-1 Creación exitosa (http/https):** una URL `http(s)` bien formada y pública se acorta y devuelve un objeto válido con `shortCode` de 8 caracteres base62.
- **SP-2 Idempotencia:** al enviar dos veces la misma URL válida, la segunda respuesta devuelve el **mismo** `shortCode`/`shortUrl` que la primera (sin duplicado).
- **SP-3 Colisión de short code resuelta:** si el `shortCode` generado ya existe, el servicio lo regenera hasta encontrar uno libre y el registro se crea correctamente.
- **SP-4 UI éxito accesible:** tras el éxito, la UI muestra la short URL con botones Copy/Visit y un mensaje de éxito en una live region accesible.

### 7.2. Negativos

- **SN-1 URL inválida:** una cadena no parseable como URL devuelve `400` y la UI muestra un error inline asociado al input.
- **SN-2 Esquema no http/https:** `ftp://...`, `javascript:...`, `data:...` devuelven `400` con mensaje de error específico.
- **SN-3 Destino SSRF (localhost/privadas):** `http://localhost`, `http://127.0.0.1`, `http://192.168.1.1`, `http://172.16.5.4`, `http://10.0.0.1` devuelven `400` (bloqueo de SSRF).
- **SN-4 Error inline en UI:** cuando el endpoint responde `400`, la tool card resalta el input en estado error (borde rojo + mensaje) y lo enlaza vía `aria-describedby`, sin romper el flujo del teclado.

## 8. Fuera de alcance (en este caso)

- **Rate limiting** (sección 10.2 de `docs/REQUISITOS.md`) — explícitamente fuera de alcance.
- **Autenticación / autorización** (Better Auth) — el actor es anónimo.
- **Alias personalizados** — el `shortCode` es siempre generado, no elegido por el usuario.
- **Analytics / conteo de clics** — no se registran ni exponen clics.
- **Observabilidad / Prometheus** (sección 10.1) — se añadirá en la capa de infraestructura en una fase posterior (no por caso de uso).
- **Redirección `GET /:code`** — será el **caso de uso 2**.

## 9. Arquitectura propuesta (documentación para alinear tests e implementación)

> Esta sección describe el diseño intencional que **ya está implementado** en el repositorio; se conserva como contrato de arquitectura.

### 9.1. Tipos — `src/lib/links/types.ts`

- `ShortLink { shortCode: string; shortUrl: string; originalUrl: string; createdAt: string }`
- `CreateShortLinkInput { url: string }`
- Errores tipados (p.ej. `InvalidUrlError`, `UnsafeUrlError`, `RepositoryError`) con código de estado HTTP asociado.

### 9.2. Repositorio — `src/lib/links/repository.ts`

Interfaz `LinkRepository` (**async**):

```ts
interface LinkRepository {
  findByOriginalUrl(url: string): Promise<ShortLink | null>
  findByShortCode(code: string): Promise<ShortLink | null>
  create(data: { shortCode: string; originalUrl: string }): Promise<ShortLink>
}
```

### 9.3. Generación de short code — `src/lib/links/short-code.ts`

- `generateShortCode(length = 8): string` — base62 aleatorio, largo fijo 8.
- Debe aceptar una fuente de entropía **inyectable** para poder testear colisiones de forma determinista.

### 9.4. Validación — `src/lib/links/validate-url.ts`

- `validateUrl(url: string)` — valida `http`/`https` y bloquea `localhost`, `127.0.0.1`, `::1` y rangos privados (`10.x`, `192.168.x`, `172.16.0.0–172.31.255.255`). Devuelve un resultado tipado (ok / error con causa).

### 9.5. Orquestación — `src/lib/links/createShortLink.ts`

- `createShortLink(repo: LinkRepository, input: CreateShortLinkInput, opts?)` — función **pura y testeable** (recibe el repo por inyección). Orquesta: validar → buscar existente (idempotencia) → generar `shortCode` (reintentar en colisión) → crear.
- `opts` permite inyectar el generador de `shortCode` para tests de colisión.

### 9.6. Implementaciones del repositorio

- `src/lib/links/in-memory-repository.ts` — implementación en memoria de `LinkRepository` para tests rápidos sin BD.
- `src/lib/links/drizzle-repository.ts` + schema Drizzle `short_links` (SQLite vía `bun:sqlite`) — implementación de producción, integrada en este mismo caso de uso.

### 9.7. Endpoint — `app/api/links/route.ts`

- Handler `POST` que usa el repo configurado (producción en runtime, in-memory en tests).
- `201 Created` + JSON en éxito; `400 Bad Request` en error de validación/SSRF, con cuerpo de error tipado.

### 9.8. UI — `components/ToolCard.tsx` + `app/page.tsx`

- Tool card accesible en la landing que llama al endpoint y muestra la short URL con acciones **Copy** (`btn-copy`) / **Visit** / **Shorten another** y error inline accesible.
- Usa las clases del sistema de diseño: `tool-input`, `tool-btn-submit`, `btn-copy`, `glass-panel` (sección 3.4 de `docs/REQUISITOS.md`).
- Estados de input/button según sección 5.1/5.2; error inline vía `aria-describedby` (sección 8.1).
