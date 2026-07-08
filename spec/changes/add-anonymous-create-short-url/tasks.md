# Tasks: Add Anonymous Create Short URL

Checklist del caso de uso UC-01 (ver `docs/use-cases/create-short-url.md`). Enfoque TDD: tests antes que implementación donde aplique.

- [ ] 1. Crear `docs/use-cases/create-short-url.md` documentando el caso de uso (actor, precondiciones, flujo, escenarios, fuera de alcance, arquitectura).
- [ ] 2. Definir tipos en `src/lib/links/types.ts` (`ShortLink`, `CreateShortLinkInput`, errores tipados con código HTTP).
- [ ] 3. Implementar `src/lib/links/validate-url.ts` (`validateUrl`) validando http/https y bloqueando localhost / `127.0.0.1` / `::1` / rangos privados (`10.x`, `192.168.x`, `172.16.0.0–172.31.255.255`).
- [ ] 4. Implementar `src/lib/links/short-code.ts` (`generateShortCode(length=8)` base62) con fuente de entropía inyectable para testear colisiones.
- [ ] 5. Definir interfaz `LinkRepository` en `src/lib/links/repository.ts` (`findByOriginalUrl`, `findByShortCode`, `create`, async).
- [ ] 6. Implementar `src/lib/links/in-memory-repository.ts` para tests rápidos sin BD.
- [ ] 7. Escribir tests unitarios (Vitest) de `validate-url`, `short-code` y `in-memory-repository`.
- [ ] 8. Implementar `src/lib/links/createShortLink.ts` (función pura, repo inyectado) orquestando validar → buscar existente → generar (reintentar en colisión) → crear.
- [ ] 9. Escribir tests unitarios (Vitest) de `createShortLink` cubriendo: creación exitosa, idempotencia, rechazo de URL inválida, rechazo de esquema no http/https, rechazo SSRF y colisión de short code (vía entropía inyectada).
- [ ] 10. Crear schema Drizzle `short_links` (snake_case) y `src/lib/links/drizzle-repository.ts` (SQLite vía `better-sqlite3`); añadir config de `drizzle-kit` y migración inicial.
- [ ] 11. Implementar `app/api/links/route.ts` handler `POST` usando el repo configurado; devolver `201` + JSON o `400` en error tipado.
- [ ] 12. Crear `components/ToolCard.tsx` (tool card accesible) y actualizar `app/page.tsx` para usarla: llama al endpoint, muestra short URL con acciones Copy/Visit/Shorten another y error inline vía `aria-describedby`.
- [ ] 13. Escribir tests de componente (Testing Library) de `ToolCard`: éxito (Copy/Visit), reset de "Shorten another", y error inline accesible en `400`.
- [ ] 14. Ejecutar `bun run lint`, typecheck (tsc) y `bun run build` asegurando que pasan sin errores.
- [ ] 15. Verificar cumplimiento de `docs/REQUISITOS.md` (secciones 4.1, 5.1, 8.1): estados de input/button, clases del design system (`tool-input`, `tool-btn-submit`, `btn-copy`, `glass-panel`) y accesibilidad (landmarks, focus visible, live region).
