# Tasks: Add Short Link Redirect and Click Count

Checklist del caso de uso UC-02 (ver `docs/use-cases/redirect-and-count-clicks.md`). Enfoque TDD: tests antes que implementación donde aplique.

- [ ] 1. Crear `docs/use-cases/redirect-and-count-clicks.md` documentando el caso de uso (actor, precondiciones, flujo, escenarios, fuera de alcance, arquitectura).
- [ ] 2. Añadir tabla Drizzle `linkVisits` en `src/lib/links/schema.ts` (`id` autoincrement, `shortCode` TEXT NOT NULL como `short_code`, `visitedAt` TEXT NOT NULL como `visited_at` ISO), sin modificar `short_links`.
- [ ] 3. Extender la interfaz `LinkRepository` en `src/lib/links/repository.ts` con `recordVisit(shortCode: string): Promise<ShortLink | null>` y `countClicks(shortCode: string): Promise<number>`.
- [ ] 4. Implementar ambos métodos en `src/lib/links/in-memory-repository.ts` (mapa de visitas por código; `recordVisit` devuelve `null` si el código no existe).
- [ ] 5. Escribir tests unitarios (Vitest) de `InMemoryLinkRepository.recordVisit` / `countClicks`: código existente inserta y devuelve el link; código inexistente devuelve `null`; `countClicks` incrementa por visita.
- [ ] 6. Implementar `src/lib/links/resolveShortLink.ts` (función pura, repo inyectado): `findByShortCode` → `null` retorna `null` (sin insertar); si existe, `recordVisit` y retorna `{ originalUrl, link }`.
- [ ] 7. Escribir tests unitarios (Vitest) de `resolveShortLink`: código inexistente → `null`; código existente → `{ originalUrl, link }` y visita registrada.
- [ ] 8. Actualizar `src/lib/links/drizzle-repository.ts`: `CREATE TABLE IF NOT EXISTS link_visits (...)` idempotente en el constructor; implementar `recordVisit` (lookup luego insert) y `countClicks` (`SELECT COUNT(*)`). Mantener el driver `bun:sqlite`.
- [ ] 9. Crear `app/[shortCode]/route.ts` handler `GET` reusando el patrón `resolveRepository()` (in-memory cuando `NODE_ENV==='test'`); responder `302` + `Location` absoluta en éxito, `404` en código no encontrado.
- [ ] 10. Escribir test de integración (Vitest) de `GET /:shortCode`: `302` + `Location` absoluta para código existente; `404` para inexistente; verificar fila en `link_visits` vía `countClicks` (repo en memoria con `setLinkRepository`).
- [ ] 11. Escribir test E2E (Playwright) del botón "Visit" de `ToolCard`: abre el short URL y el navegador termina en `originalUrl`; el clic queda registrado (verificable vía estado interno / `countClicks`).
- [ ] 12. Ejecutar `bun run lint`, `bun run typecheck` y `bun run build` asegurando que pasan sin errores.
