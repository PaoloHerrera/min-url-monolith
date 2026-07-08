## 🚀 Release: Develop ➔ Master

### 📦 Resumen del Release

_Describe qué casos de uso, características principales o correcciones críticas se completan e integran a producción en este release._

### 📋 Lista de Cambios (Changelog)

- [ ] **Caso de Uso / Feature:** _Descripción del caso de uso completado_
- [ ] **Bugfix:** _Descripción del error corregido_
- [ ] **Otros:** _Otros cambios relevantes_

### 🧪 Pruebas de Calidad Realizadas

- [ ] **Tests Unitarios / Integración (Vitest):** `bun run test` completado con éxito.
- [ ] **Tests E2E (Playwright):** `bun run test:e2e` verificado y sin fallos.
- [ ] **Construcción de Docker:** La app compila y levanta correctamente en producción local (`docker compose up --build`).
- [ ] **Tipo-Safe:** Validación de tipos sin errores (`bun run typecheck`).

### 📊 Observabilidad e Instrumentación (SRE)

- [ ] ¿Este release incluye nuevas métricas en `/api/metrics`? (Si aplica, descríbelas).
- [ ] ¿Requiere actualizar o agregar variables de entorno en el contenedor de Docker?

### ✅ Checklist Final

- [ ] El CI de la rama `develop` está completamente en verde (aprobado).
- [ ] Todos los commits siguen la convención _Conventional Commits_.
