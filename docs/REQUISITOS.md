# REQUISITOS DE DISEÑO Y TÉCNICA — Min-URL

> **Versión:** 1.1.0  
> **Última actualización:** 2026-07-09  
> **Propietario:** Equipo de plataforma (laboratorio de estrés)

---

## Índice

1. [Descripción del Proyecto](#1-descripción-del-proyecto)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Sistema de Diseño](#3-sistema-de-diseño)
4. [Páginas y Layouts](#4-páginas-y-layouts)
5. [Estados de UI por Componente](#5-estados-de-ui-por-componente)
6. [Responsive](#6-responsive)
7. [Modo Claro/Oscuro](#7-modo-clarooscuro)
8. [Accesibilidad](#8-accesibilidad)
9. [Animación](#9-animación)
10. [Objetivos de Laboratorio](#10-objetivos-de-laboratorio)

---

## 1. Descripción del Proyecto

### 1.1. ¿Qué es Min-URL?

Min-URL es un **acortador de URLs monolítico** construido con Next.js. Permite a cualquier visitante **acortar una URL larga y compartirla sin registrarse**, y redirige los códigos cortos contando cada clic. No hay cuentas, dashboard ni panel de estadísticas: el producto se reduce a dos casos de uso (UC-01 y UC-02) diseñados para ser estresados.

### 1.2. Propósito

El proyecto sirve como **laboratorio de pruebas de estrés y observabilidad** para comparar el rendimiento, la escalabilidad y la mantenibilidad de una arquitectura monolítica frente a su homólogo distribuido. El alcance actual se limita a:

- **UC-01 — Crear short URL anónima:** cualquiera acorta una URL larga vía `POST /api/links` (sin login).
- **UC-02 — Redirigir y contar clics:** `GET /:shortCode` responde 302 y registra el clic en `link_visits`.

Sobre esta base mínima, el laboratorio se presta a:

- **Pruebas de carga con K6** — simulación de tráfico concurrente realista.
- **Observabilidad** — integración con Prometheus, Grafana y Loki para monitorización.
- **Comparación arquitectónica** — métricas del monolito vs. sistema distribuido hermano.
- **Portfolio técnico** — vitrina de buenas prácticas de ingeniería (accesibilidad, diseño system, testing).

### 1.3. Público objetivo

- Ingenieros de software senior que evalúan la arquitectura del proyecto.
- Reclutadores técnicos que revisan el código como parte de un portfolio.
- Contribuyentes del proyecto distribuido hermano que necesitan contexto.

---

## 2. Stack Tecnológico

| Capa               | Tecnología                                 | Versión / Notas                                                                         |
| ------------------ | ------------------------------------------ | --------------------------------------------------------------------------------------- |
| **Framework**      | Next.js (App Router)                       | 16+ (estable recomendada: 16.2+)                                                        |
| **Lenguaje**       | TypeScript                                 | Strict mode, `@total-typescript/tsconfig` recomendado                                   |
| **Auth**           | — (sin autenticación)                      | Fuera de alcance del laboratorio actual                                                 |
| **Base de datos**  | SQLite vía `bun:sqlite`                    | Builtin de Bun (zero-dependency, embedded)                                              |
| **ORM**            | Drizzle ORM                                | Schema-first, tipo-safe (`drizzle-orm/bun-sqlite`)                                      |
| **Estilos**        | Tailwind CSS                               | **v4** (config CSS-based vía `@tailwindcss/postcss`, sin `tailwind.config.*`)           |
| **Tipografía**     | Geist (Vercel)                             | Heading + body (variable font)                                                          |
| **Iconos**         | Lucide React                               | SVG puro, tree-shakeable                                                                |
| **Animación**      | CSS Transitions / Tailwind `transition-*`  | 150–300ms, `ease-out`, respeta `prefers-reduced-motion`                                 |
| **Testing carga**  | K6                                         | **Núcleo del lab**: scripts en `/k6/` (smoke, load, stress, spike, soak)                |
| **Métricas**       | Prometheus client (instrumentación manual) | **Núcleo del lab**: endpoint `/api/metrics` (HTTP metrics, histogramas, event-loop lag) |
| **Observabilidad** | pino (logs JSON) + Loki + Grafana          | **Núcleo del lab**: logging estructurado e ingestión para monitorización                |
| **Contenedor**     | Docker + docker-compose                    | **Núcleo del lab**: multi-stage build + stack `app`/`prometheus`/`grafana`/`loki`       |

### 2.1. Convenciones de código

| Regla                     | Especificación                                                |
| ------------------------- | ------------------------------------------------------------- |
| Gestor paquetes / Runtime | `bun`                                                         |
| Formateo                  | Prettier (100 ancho, single quotes, trailing commas)          |
| Linting                   | ESLint flat config + `@typescript-eslint/strict-type-checked` |
| Commits                   | Conventional Commits (`feat:`, `fix:`, `chore:`, etc.)        |
| Testing unitario          | Vitest + Testing Library (componentes)                        |

---

## 3. Sistema de Diseño

El sistema de diseño es **heredado del proyecto distribuido hermano**. Todos los tokens deben coincidir exactamente para garantizar consistencia visual entre ambas arquitecturas.

> **Nota de alcance:** En el estado actual del laboratorio (UC-01 + UC-02, sin auth/dashboard/analytics), este sistema de diseño se aplica exclusivamente a la **landing page (`/`)** — hero, tool card, sección de features/bento y footer. Es la base visual que la próxima fase de UX/UI pulirá y extenderá.

### 3.1. Colores — Tokens CSS

Los colores se definen como **CSS custom properties** en `:root` (modo oscuro por defecto) y en `:root.light` (modo claro).

#### Brand

| Token               | Valor     | Uso                              |
| ------------------- | --------- | -------------------------------- |
| `--color-brand-500` | `#0056FF` | Electric blue — accent principal |

#### Modo oscuro (default)

| Token              | Valor                    | Uso                                   |
| ------------------ | ------------------------ | ------------------------------------- |
| `--bg-base`        | `#030712`                | Fondo de página                       |
| `--bg-raised`      | `#0a1120`                | Superficie elevada (nav, sidebar)     |
| `--bg-overlay`     | `#111827`                | Modales, dropdowns, tooltips          |
| `--bg-glass`       | `rgba(255,255,255,0.02)` | Fondo glass translúcido               |
| `--bg-card`        | `rgba(255,255,255,0.03)` | Fondo de cards                        |
| `--text-primary`   | `#f1f5f9`                | Texto principal                       |
| `--text-secondary` | `#94a3b8`                | Texto secundario (subtítulos, labels) |
| `--text-muted`     | `#64748b`                | Texto deshabilitado / placeholder     |
| `--border-subtle`  | `rgba(255,255,255,0.08)` | Bordes de baja prominencia            |
| `--border-soft`    | `rgba(255,255,255,0.12)` | Bordes de media prominencia           |
| `--glow-brand`     | `rgba(0,86,255,0.25)`    | Sombra brillante brand                |

#### Modo claro

| Token              | Valor                 | Uso                               |
| ------------------ | --------------------- | --------------------------------- |
| `--bg-base`        | `#f8faff`             | Fondo de página                   |
| `--bg-raised`      | `#ffffff`             | Superficie elevada                |
| `--text-primary`   | `#0f172a`             | Texto principal                   |
| `--text-secondary` | `#334155`             | Texto secundario                  |
| `--text-muted`     | `#64748b`             | Texto deshabilitado / placeholder |
| `--border-subtle`  | `rgba(15,23,42,0.08)` | Bordes de baja prominencia        |
| `--border-soft`    | `rgba(15,23,42,0.12)` | Bordes de media prominencia       |

> **Nota:** En modo claro, `--bg-overlay`, `--bg-glass`, `--bg-card` y `--glow-brand` se redefinen con equivalentes claros. La implementación completa de los tokens vive en `app/globals.css` (Tailwind v4, config CSS-based, sin `tailwind.config.*`).

### 3.2. Tipografía

| Propiedad       | Valor                                           | Notas                                |
| --------------- | ----------------------------------------------- | ------------------------------------ |
| Font family     | `Geist`                                         | Variable font de Vercel              |
| Weights         | 400, 500, 600, 700                              | Para body (400) y headings (600–700) |
| Escala headings | `text-2xl` a `text-5xl`                         | Tailwind responsive scale            |
| Body            | `text-base` (16px)                              | `leading-relaxed` (1.625)            |
| Mono            | `Geist Mono`                                    | Para URLs y código                   |
| Modo de carga   | `swap` (FOUT mitigado con `font-display: swap`) |                                      |

### 3.3. Espaciado

Se usa la escala nativa de Tailwind:

| Token CSS    | Tailwind | Píxeles (aprox) |
| ------------ | -------- | --------------- |
| `--space-1`  | `1`      | 4px             |
| `--space-2`  | `2`      | 8px             |
| `--space-3`  | `3`      | 12px            |
| `--space-4`  | `4`      | 16px            |
| `--space-6`  | `6`      | 24px            |
| `--space-8`  | `8`      | 32px            |
| `--space-12` | `12`     | 48px            |
| `--space-16` | `16`     | 64px            |

### 3.4. Componentes existentes (a reutilizar)

| Clase / Componente  | Descripción                                                   |
| ------------------- | ------------------------------------------------------------- |
| `glass-panel`       | Fondo glass con `backdrop-filter: blur(12px)` y border sutil  |
| `glass-panel-hover` | Como `glass-panel` + `box-shadow` con `--glow-brand` en hover |
| `btn-cta`           | Gradient violeta (`#5b21b6`) → electric blue (`#0056FF`)      |
| `btn-copy`          | Gradient azul cielo (`#0ea5e9` → `#38bdf8`)                   |
| `tool-input`        | Input con icono, dark/light mode, focus ring electric blue    |
| `tool-btn-submit`   | Submit button con gradient electric blue                      |
| `tool-btn-ghost`    | Ghost button para acciones secundarias                        |

### 3.5. Background grid (opcional)

| Clase             | Definición                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------------ |
| `bg-grid-pattern` | Grid de 50px con opacidad 1.5% — aplicado como `background-image` con SVG inline o CSS `repeating-linear-gradient` |

> La rejilla es decorativa y **debe respetar `prefers-reduced-motion`** (ocultar en modo reducido). No debe interferir con la legibilidad del contenido.

### 3.6. Radios y sombras

| Token CSS             | Valor                         | Uso                          |
| --------------------- | ----------------------------- | ---------------------------- |
| `--radius-sm`         | `6px`                         | Inputs, botones pequeños     |
| `--radius-md`         | `10px`                        | Cards, modales               |
| `--radius-lg`         | `16px`                        | Paneles grandes              |
| `--radius-full`       | `9999px`                      | Píldoras, avatares           |
| `--shadow-card`       | `0 4px 24px rgba(0,0,0,0.3)`  | Sombra de card (modo oscuro) |
| `--shadow-card-light` | `0 4px 24px rgba(0,0,0,0.06)` | Sombra de card (modo claro)  |

---

## 4. Páginas y Layouts

### 4.1. Landing Page (`/`)

La landing es el **único destino de la aplicación** en el alcance actual. Es una "landing completa y pulida" cuyo objetivo es (a) permitir acortar una URL sin autenticación y (b) comunicar que el sitio es un laboratorio de estrés/observabilidad. Puede contener las siguientes secciones:

```
┌─────────────────────────────────────────────────────┐
│  ✦ BADGE (p. ej. "Laboratorio de rendimiento SRE")   │  ← Badge decorativo
│                                                      │
│   Min-URL Monolith  (Hero, título grande gradiente)   │  ← Hero
│   Acorta y comparte URLs; redirige y cuenta clics    │  ← Tagline
│                                                      │
│   ┌─ background grid + glows decorativos ─────────┐ │  ← Grid + glows
│   │  🔗 https://ejemplo.com/...   [ Shorten ]      │ │  ← Tool card (tool-input + tool-btn-submit)
│   └────────────────────────────────────────────────┘│
│                                                      │
│   ┌── Éxito ──────────────────────────────────────┐ │
│   │  ✓ URL acortada                                │ │
│   │  min-url.dev/abc123                            │ │
│   │  [ Copy ]  [ Visit ]  [ Shorten another ]      │ │
│   └────────────────────────────────────────────────┘│
│                                                      │
│  ┌── Feature / Bento grid (3 cards) ──────────────┐  │  ← Sección de features (bento)
│  │  ⚡ Rendimiento · 📊 Observabilidad · 🐳 Docker  │  │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  Footer minimal © 2026                               │  ← Footer
└─────────────────────────────────────────────────────┘
```

> **Estructura permitida:** la landing **puede** incluir hero con badge, glows y background grid decorativos, la tool card funcional, una sección de features / bento grid (hasta 3 cards) y footer. **No** está prohibido el bento grid ni las secciones de features — la versión actual de `app/page.tsx` ya las implementa y la próxima fase de UX/UI las conservará y pulirá.

**Requisitos funcionales:**

- [x] Tool card accesible sin autenticación (cualquier usuario puede acortar).
- [x] Tras acortar, mostrar estado de éxito con las acciones Copy / Visit / Shorten another.
- [x] El botón "Shorten another" resetea el formulario.
- [x] Footer minimal (copyright + versión).
- [ ] Toggle dark/light funcional (pendiente de la fase UX/UI).
- [ ] Navbar mínimo opcional (logo + toggle de tema); el login/register han sido eliminados.

> **Nota:** Auth (`/login`, `/register`), Dashboard (`/dashboard`) y Analytics (`/dashboard/[linkId]`) fueron **eliminados del alcance**. Sus especificaciones se conservan en el historial (Apéndice C) pero ya no se implementan.

---

## 5. Estados de UI por Componente

### 5.1. Input / tool-input

| Estado       | Comportamiento                                            |
| ------------ | --------------------------------------------------------- |
| **Normal**   | Borde sutil (`--border-subtle`), fondo `--bg-card`        |
| **Hover**    | Borde `--border-soft`, transición 150ms                   |
| **Focus**    | Ring `2px solid --color-brand-500`, outline offset 2px    |
| **Active**   | Fondo ligeramente más oscuro (profundidad táctil)         |
| **Disabled** | Opacidad 0.5, `cursor: not-allowed`, sin hover/focus      |
| **Loading**  | Spinner inline (Lucide `LoaderCircle` con animación spin) |
| **Error**    | Borde rojo (`#ef4444`) + mensaje inline debajo del input  |
| **Success**  | Checkmark verde (`#22c55e`) + borde verde durante 2s      |

### 5.2. Botón / tool-btn-submit / btn-cta / btn-copy

| Estado       | Comportamiento                                           |
| ------------ | -------------------------------------------------------- |
| **Normal**   | Gradient definido por clase, border-radius `--radius-sm` |
| **Hover**    | Luminosidad +10% (o añadir glow brand), transición 200ms |
| **Focus**    | Ring electric blue, outline offset 2px                   |
| **Active**   | Escala 0.97 (`transform: scale(0.97)`) + sombra reducida |
| **Disabled** | Opacidad 0.5, `cursor: not-allowed`, sin hover/active    |
| **Loading**  | Spinner sustituye al texto (mantiene ancho mínimo)       |

### 5.3. Card / glass-panel

| Estado      | Comportamiento                                               |
| ----------- | ------------------------------------------------------------ |
| **Normal**  | Fondo `--bg-card` (o `--bg-glass`), border `--border-subtle` |
| **Hover**   | (`glass-panel-hover`) Borde `--border-soft` + glow brand     |
| **Empty**   | Mensaje centrado + icono decorativo + CTA                    |
| **Loading** | Skeleton shimmer (Tailwind `animate-pulse` o custom)         |

### 5.4. Toast / Feedback

| Tipo        | Comportamiento                                                 |
| ----------- | -------------------------------------------------------------- |
| **Success** | Fondo verde (`#059669`), icono checkmark, 4s de duración       |
| **Error**   | Fondo rojo (`#dc2626`), icono alerta, persistente hasta cerrar |
| **Info**    | Fondo azul (`#2563eb`), icono info, 3s de duración             |

---

## 6. Responsive

### 6.1. Breakpoints

| Breakpoint | Ancho mínimo | Objetivo                     |
| ---------- | ------------ | ---------------------------- |
| `mobile`   | 375px        | Dispositivos pequeños        |
| `tablet`   | 768px        | Tablets en vertical          |
| `desktop`  | 1024px       | Laptops / tablets horizontal |
| `wide`     | 1440px       | Pantallas grandes            |

### 6.2. Comportamiento por página

| Página      | ≤ 768px (mobile)                                         | ≥ 1024px (desktop)                           |
| ----------- | -------------------------------------------------------- | -------------------------------------------- |
| **Landing** | Tool card full-width, hero font más pequeño, bento 1 col | Tool card centrado (max ~640px), bento 3 col |

### 6.3. Reglas generales

- [ ] **Touch targets** mínimos de `44×44px` (botones, iconos clickeables).
- [ ] **Sin scroll horizontal** en ningún viewport.
- [ ] Navegación colapsada en mobile (hamburger menu o drawer).
- [ ] Tablas con `overflow-x: auto` solo si es estrictamente necesario.
- [ ] Imágenes decorativas con `display: none` en mobile si afectan rendimiento.

---

## 7. Modo Claro/Oscuro

### 7.1. Default y toggle

- El tema por defecto es **dark mode** (`prefers-color-scheme: dark`).
- El usuario puede cambiar con un **toggle** en la interfaz (icono sol/luna en nav).
- La preferencia persiste en `localStorage` y en cookie (para SSR).

### 7.2. Implementación técnica

- Clase `.light` en `<html>` para el modo claro.
- Todas las variables de color tienen contraparte en `:root.light` (ver [3.1](#31-colores--tokens-css)).
- Tailwind: usar `dark:` para variantes y `light:` no es necesario si usamos clases semánticas.

### 7.3. Contraste

- **Ratio mínimo WCAG AA:** 4.5:1 para texto normal, 3:1 para texto grande (≥18px bold o ≥24px).
- El brand color (`#0056FF`) debe testearse contra fondos claros y oscuros para cumplir AA.
- En modo claro, el brand puede oscurecerse ligeramente (p.ej. `#0040CC`) si falla contraste sobre fondo blanco.

### 7.4. Transición entre modos

- Transición suave de 300ms en `background-color` y `color` para evitar flashes.

```css
*,
*::before,
*::after {
  transition:
    background-color 300ms ease-out,
    color 300ms ease-out,
    border-color 300ms ease-out;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    transition: none;
  }
}
```

---

## 8. Accesibilidad

### 8.1. Checklist obligatorio

| Requisito                 | Criterio de aceptación                                                                        |
| ------------------------- | --------------------------------------------------------------------------------------------- |
| **Skip to content**       | Primer foco tabulable, enlace "Saltar al contenido"                                           |
| **Landmarks**             | `<header>`, `<main>`, `<nav>`, `<footer>` semánticos                                          |
| **Heading hierarchy**     | Un solo `<h1>` por página, jerarquía sin saltos                                               |
| **Alt text en iconos**    | Iconos decorativos: `aria-hidden="true"`. Iconos meaningful: `alt` descriptivo o `aria-label` |
| **Form labels**           | Todos los inputs tienen `<label>` visible                                                     |
| **Error inline**          | Mensajes de error asociados via `aria-describedby`                                            |
| **Keyboard navigation**   | Tab order lógico, focus visible (`:focus-visible`)                                            |
| **Reduced motion**        | `prefers-reduced-motion: reduce` desactiva animaciones decorativas                            |
| **Color alone**           | Ningún estado usa solo color (icono + texto o patrón)                                         |
| **Focus trap en modales** | Ciclo focus dentro del modal, Escape cierra                                                   |
| **Live regions**          | Toast / notificaciones usan `aria-live="polite"`                                              |

### 8.2. Focus visible

- Usar `:focus-visible` para mostrar el ring solo en navegación por teclado.
- El ring debe ser de al menos 2px con offset 2px.

```css
:focus-visible {
  outline: 2px solid var(--color-brand-500);
  outline-offset: 2px;
}
```

### 8.3. Teclado

- Todas las acciones disponibles por ratón deben ser también accesibles por teclado.
- Tablas: navegación con flechas (opcional para v1, recomendado para v2).
- El dashboard ofrece atajos de teclado (p.ej. `n` para nuevo link) — documentados en la UI.

---

## 9. Animación

### 9.1. Principios

- **Duración:** 150–300ms (micro-interacciones: 150ms; transiciones de página: 200–300ms).
- **Easing:** `ease-out` por defecto (salida suave, entrada rápida).
- **Propósito:** cada animación debe tener un propósito funcional (feedback, orientación, transición de estado).
- **Sin layout shift:** animar solo propiedades compositoras (`transform`, `opacity`).
- **Performance:** preferir GPU-accelerated properties (`transform`, `opacity`, `filter`).

### 9.2. Micro-interacciones

| Elemento | Acción   | Animación                                    |
| -------- | -------- | -------------------------------------------- |
| Botón    | Hover    | Luminosidad +10% (200ms)                     |
| Botón    | Active   | `scale(0.97)` (150ms)                        |
| Input    | Focus    | Ring aparece 200ms, no animar borde          |
| Card     | Hover    | Glow brand aparece 200ms                     |
| Tooltip  | Aparecer | Fade + translateY(4px → 0) 200ms             |
| Modal    | Open     | Fade overlay + scale(0.95 → 1) panel 250ms   |
| Modal    | Close    | Fade out 150ms                               |
| Toast    | Enter    | Slide desde top-right, fade in 300ms         |
| Toast    | Exit     | Fade + slide out 200ms                       |
| Skeleton | Shimmer  | `animate-pulse` o gradient sweep (1.5s loop) |

### 9.3. Loading states

- **Skeleton shimmer** para contenido asíncrono (tablas, gráficos, cards).
- Usar Tailwind `animate-pulse` o un keyframe personalizado con gradient sweep.
- El shimmer debe ser sutil: opacidad 0.05–0.1 sobre fondo base.

### 9.4. prefers-reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  /* Excepciones: animaciones funcionales (spinner de loading) */
  .loader-spinner {
    animation-duration: 1s !important;
    animation-iteration-count: infinite !important;
  }
}
```

---

## 10. Objetivos de Laboratorio

> **Fase de implementación:** Observabilidad, rate limiting, Docker y K6 son el **norte del laboratorio**, pero se implementarán en una **fase posterior a la de UX/UI**. En el estado actual solo están documentados; el código de `/api/metrics`, pino/Loki y los scripts `/k6` aún no existe.

### 10.1. Instrumentación

| Componente          | Tecnología                 | Detalle                                                      |
| ------------------- | -------------------------- | ------------------------------------------------------------ |
| **Métricas HTTP**   | `prom-client` (Prometheus) | Endpoint `/api/metrics` expone métricas en texto plano       |
| **Métricas custom** | Contadores e histogramas   | Tiempo de respuesta, tasa de aciertos, errores 4xx/5xx       |
| **Event loop lag**  | `process.hrtime` + gauge   | Monitoriza bloqueo del event loop cada 100ms                 |
| **Logging**         | `pino` (JSON) + Loki       | Logs estructurados para ingestión en Grafana Loki            |
| **APM**             | Opcional: OpenTelemetry    | Trazas distribuidas para comparación con sistema distribuido |

### 10.2. Rate limiting (opcional / lab)

> **Opcional:** no bloquea el alcance actual (UC-01 + UC-02). Se considera una mejora de laboratorio, no un requisito obligatorio de la primera fase.

| Estrategia    | Implementación                                    |
| ------------- | ------------------------------------------------- |
| **In-memory** | `Map<string, { count, resetTime }>` por IP        |
| **Ventana**   | Fija (1 minuto) o deslizante (sliding window)     |
| **Límites**   | 100 req/min por IP en `/api/links`                |
| **Excepción** | Endpoint `/api/metrics` excluido de rate limiting |

### 10.3. Dockerización

| Recurso            | Descripción                                                 |
| ------------------ | ----------------------------------------------------------- |
| **Dockerfile**     | Multi-stage: build con Bun (oven/bun), runtime minimizado   |
| **docker-compose** | Servicios: `app` (Next.js), `prometheus`, `grafana`, `loki` |
| **Volúmenes**      | Persistencia para SQLite (`./data/`) y config de Prometheus |

### 10.4. Pruebas de estrés (K6)

| Script          | Propósito                                           |
| --------------- | --------------------------------------------------- |
| `/k6/smoke.js`  | Smoke test: 1 VU, 30s para verificar funcionamiento |
| `/k6/load.js`   | Carga constante: 50 VUs, 5 min                      |
| `/k6/stress.js` | Estrés progresivo: 10→200 VUs en 10 min             |
| `/k6/spike.js`  | Pico: salto de 0 a 500 VUs en 30s                   |
| `/k6/soak.js`   | Resistencia: 100 VUs durante 30 min                 |

**Métricas objetivo:**

| Métrica                   | Objetivo              |
| ------------------------- | --------------------- |
| `http_req_duration` (p95) | < 500ms               |
| `http_req_duration` (p99) | < 1500ms              |
| `http_req_failed`         | < 1%                  |
| `iterations`              | > 1000/s (bajo carga) |
| Event loop lag (máximo)   | < 50ms                |

### 10.5. Dashboard de observabilidad (Grafana)

| Panel                   | Fuente     | Métrica                                    |
| ----------------------- | ---------- | ------------------------------------------ |
| Request rate            | Prometheus | `rate(http_requests_total[1m])`            |
| Latency (p50, p95, p99) | Prometheus | `histogram_quantile(0.95, ...)`            |
| Error rate              | Prometheus | `rate(http_requests_total{status=~"5.."})` |
| Event loop lag          | Prometheus | `node_event_loop_lag_seconds`              |
| Logs (app)              | Loki       | `{app="min-url"}`                          |

---

## Apéndice A: Convenciones de nombres

| Tipo                      | Convención     | Ejemplo              |
| ------------------------- | -------------- | -------------------- |
| Componentes React         | PascalCase     | `GlassPanel.tsx`     |
| Funciones de utilidad     | camelCase      | `formatDate.ts`      |
| Schemas Drizzle           | snake_case     | `short_links`        |
| Archivos de ruta Next.js  | kebab-case     | `create-link.tsx`    |
| Archivos de configuración | kebab-case     | `docker-compose.yml` |
| Variables CSS             | `--kebab-case` | `--bg-card`          |

## Apéndice B: Glosario

| Término              | Definición                                                  |
| -------------------- | ----------------------------------------------------------- |
| **Glass panel**      | Componente con fondo semi-transparente, blur y borde sutil  |
| **Glow brand**       | Sombra exterior con el color brand para efecto de brillo    |
| **Skeleton shimmer** | Placeholder animado para contenido en carga                 |
| **Tool card**        | Card funcional en la landing que contiene el input URL      |
| **FAB**              | Floating Action Button — botón flotante para crear links    |
| **Layout shift**     | Cambio inesperado en la posición de elementos durante carga |

---

## Apéndice C: Historial de cambios

| Versión | Fecha      | Cambios                                                                                                                                                                                                    |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-07-06 | Versión inicial del documento de requisitos                                                                                                                                                                |
| 1.1.0   | 2026-07-09 | Recorte de alcance: se eliminan Dashboard/Analytics/Auth; enfoque en UC-01/UC-02 + observabilidad. `better-sqlite3` → `bun:sqlite`; Tailwind v3.4 → v4; landing permite hero/badge/grid/glows/bento/footer |

---

_Documento mantenido por el equipo de plataforma. Para reportar inconsistencias, abre un issue en el repositorio._
