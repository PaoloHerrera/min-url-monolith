# Plan de Implementación: Pulido UX/UI de la Landing Page (Min-URL)

> **Estado:** Fase próxima (post-UC-01/UC-02, pre-observabilidad).
> **Enfoque:** React directo + **shadcn/ui** (Tailwind v4). **NO** OpenPencil.
> **Referencia de requisitos:** `docs/REQUISITOS.md` (§4.1 Landing, §5 Estados de UI, §6–§8 Responsive/Modo claro/Accesibilidad).

---

## Contexto

La landing (`app/page.tsx`) **ya existe** y está parcialmente pulida: incluye hero con badge, glows y background grid decorativos, la `ToolCard` funcional, una sección de features / bento grid de 3 cards y un footer minimal. Esta fase no recrea la landing desde cero; la **conserva y la refina** para cumplir al 100% los estados de UI, la accesibilidad y el responsive definidos en REQUISITOS.

> ⚠️ **OpenPencil es OBSOLETO para este proyecto.** Las referencias previas a `designs/landing_page.op` y al editor OpenPencil (live canvas en puerto 7600) **no se aplican**. El diseño de la landing se implementa directamente en código con shadcn/ui sobre el sistema de tokens existente (`docs/REQUISITOS.md` §3). Los archivos de diseño activos son `designs/*.pen` (accesibles únicamente vía las herramientas MCP de `pencil`); el flujo OpenPencil quedó descartado.

---

## Objetivos de la fase

1. **Cumplir todos los estados de UI** de REQUISITOS §5.1 (Input) y §5.2 (Button) en `ToolCard`.
2. **Accesibilidad (§8):** skip link, landmarks semánticos, focus-visible, `aria-live` en feedback, `prefers-reduced-motion`.
3. **Toggle dark/light funcional** (cookie + `localStorage`, clase `.light` en `<html>`), §7.
4. **Responsive completo** (mobile/tablet/desktop), §6.
5. **Componentes shadcn/ui** para consistencia y calidad de implementación.

---

## Componentes a pulir

### 1. Hero (`app/page.tsx`)

- Conservar: badge decorativo, título con gradiente, tagline, glows y background grid.
- Asegurar `prefers-reduced-motion`: el background grid y los glows se ocultan/atenúan en modo reducido (§3.5, §9.4).
- Jerarquía de headings correcta (un solo `<h1>`).

### 2. ToolCard (`components/ToolCard.tsx`)

- Estados completos según §5.1/§5.2:
  - **Input:** normal, hover, focus (ring brand), active, disabled, loading (spinner inline), error (borde rojo + mensaje inline vía `aria-describedby`), success (checkmark 2s).
  - **Button:** normal, hover (glow), focus, active (scale 0.97), disabled, loading (spinner sustituye texto).
- Tras acortar: estado de éxito con **Copy** (`btn-copy`), **Visit**, **Shorten another** (resetea el formulario).
- Feedback accesible en `aria-live="polite"` (§8.1).
- Migrar a primitivas shadcn/ui (`Input`, `Button`, `Toast`) manteniendo las clases de tokens (`tool-input`, `tool-btn-submit`, `btn-copy`, `glass-panel`).

### 3. Navbar mínimo (opcional, nuevo)

- Logo + toggle dark/light. **Sin** login/register (auth eliminada).
- Landmark `<nav>` semántico; colapsable en mobile.

### 4. Footer (`app/page.tsx`)

- Minimal: copyright + versión. Landmark `<footer>`.

### 5. Background grid + glows

- Reutilizar `bg-grid-pattern` (§3.5) / implementación inline actual; respetar `prefers-reduced-motion`.

### 6. Toggle dark/light

- Implementar con shadcn/ui `ThemeProvider` (o equivalente) + persistencia cookie para SSR y `localStorage`.
- Transición suave 300ms en `background-color`/`color` (§7.4).

### 7. Responsive

- Mobile (≤768px): tool card full-width, hero más pequeño, bento 1 columna.
- Desktop (≥1024px): tool card centrada (max ~640px), bento 3 columnas (§6.2).
- Touch targets ≥ 44×44px; sin scroll horizontal.

---

## Plan de verificación

1. **Lint + Build:** `bun run lint` y `bun run build` sin errores.
2. **Manual a11y:** navegación por teclado (Tab/Shift+Tab), focus-visible, skip link, `aria-live` en éxito/error.
3. **Toggle tema:** cambiar dark/light, recargar (persistencia cookie), verificar sin flash.
4. **Responsive:** probar en 375 / 768 / 1024 / 1440px.
5. **Reduced motion:** activar `prefers-reduced-motion` y verificar que glows/grid se atenúan.

---

## Fuera de alcance en esta fase

- Observabilidad (Prometheus/Loki/K6/Docker) — fase posterior.
- Auth / Dashboard / Analytics / alias personalizados — descartados.
- OpenPencil / `designs/landing_page.op` — obsoletos.
