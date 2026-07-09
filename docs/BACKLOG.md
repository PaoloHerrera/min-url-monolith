# Backlog y temas de discusión — Min-URL

Documento general para debatir casos de uso siguientes y decisiones abiertas. No es una especificación formal.

## Casos de uso propuestos (orden sugerido)

1. **Redirección `GET /:shortCode`** — resolver el código a la URL original y redirigir (302). Debe contar el clic (analytics). Caso de uso natural posterior a "crear".
2. **Rate limiting** — sección 10.2 de REQUISITOS. Ventana fija/deslizante por IP. Fuera del caso 1 por decisión explícita.
3. **Autenticación (Better Auth)** — registro/login, sesión; distinguir links anónimos vs. de usuario.
4. **Alias personalizados** — solo usuarios autenticados; validación de colisiones con códigos auto-generados.
5. **Dashboard y Analytics** — tabla de enlaces, stats de clics, serie temporal.
6. **Observabilidad** — Prometheus `/api/metrics`, logging estructurado (pino), Grafana/Loki.

## Decisiones abiertas

- **Driver SQLite:** se usa `better-sqlite3` + `drizzle-orm/better-sqlite3` (el indicado en REQUISITOS). `bun:sqlite` quedó descartado porque el server de Next se ejecuta sobre el runtime **Node**, donde ese builtin no está disponible.
- **Base URL de `shortUrl`:** por defecto `http://localhost:3000`; en producción debe venir de `NEXT_PUBLIC_APP_URL`/env. Definir el dominio real (`min-url.dev`).
- **Protección SSRF:** se valida el _host literal_ del input (sin resolución DNS) para no dañar la latencia del laboratorio de estrés. Revisar si se requiere validación más estricta (listas de rangos CIDR, bloqueo de nombres `.local`).
- **Colisión de short code:** reintento en bucle con base62 aleatorio; a escala (K6) conviene medir la tasa de colisión y considerar longitud adaptable.
- **Cliques/analytics:** decidir si el conteo se hace en la redirección (caso 2) y con qué modelo de almacenamiento (misma tabla `short_links` o tabla separada `link_visits`).
