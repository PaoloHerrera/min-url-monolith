# Plan de Implementación: Diseño de la Landing Page de Min-URL en OpenPencil

Este plan describe la propuesta de diseño y la estructura técnica para construir la **Landing Page** de **Min-URL** (un acortador de enlaces monolítico) en OpenPencil, basándonos estrictamente en el documento de requisitos [REQUISITOS.md](file:///d:/Proyectos/Min-URL-monolith/docs/REQUISITOS.md).

---

## Estructura de la Landing Page

De acuerdo con los requisitos funcionales, la página de aterrizaje debe ser extremadamente limpia, sin secciones de características adicionales (features), cuadrículas bento, testimonios o sobrecargas visuales. Tendrá tres componentes principales:

1. **Barra de Navegación Minimalista (Navbar)**
2. **Sección Hero con la Tool Card (Acortador funcional)**
3. **Footer Minimalista**

Propondremos dos vistas en el archivo de diseño para garantizar la consistencia responsive:

- **Vista Desktop (Escritorio):** Ancho `1200px` con scroll vertical automático (altura inicial estimada `1000px`).
- **Vista Mobile (Móvil):** Ancho `375px` y altura fija `812px` (estilo aplicación/tarea única móvil).

---

## Propuesta de Diseño Visual

Usaremos la paleta oscura por defecto (Dark Mode) especificada en el sistema de diseño:

- **Fondo de Página (`--bg-base`):** `#030712` (azul oscuro profundo).
- **Superficie de Tarjetas (`--bg-card`):** `rgba(255, 255, 255, 0.03)` con bordes sutiles de `rgba(255, 255, 255, 0.08)` y filtro de desenfoque de fondo (`backdrop-filter: blur(12px)`).
- **Color de Acento Brand (`--color-brand-500`):** `#0056FF` (azul eléctrico de alta visibilidad).
- **Tipografía:** Familia `Geist` (usando "Inter" o "Space Grotesk" como fallback visual en OpenPencil) con pesos `700` para títulos principales, `500`/`600` para componentes y `400` para texto de cuerpo.

---

## Estructura de Componentes en OpenPencil (Árbol de Nodos)

El archivo de diseño se creará en la nueva carpeta del repositorio: [designs/landing_page.op](file:///d:/Proyectos/Min-URL-monolith/designs/landing_page.op).

### 1. Vista de Escritorio (Desktop Viewport)

- **Root Frame (`desktop-root`):** `type: "frame"`, `width: 1200`, `layout: "vertical"`, `fill: "#030712"`, `alignItems: "center"`, `padding: [0, 80]`.
  - **Navbar (`desktop-nav`):** `role: "navbar"`, `width: 1040`, `height: 72`, `layout: "horizontal"`, `justifyContent: "space_between"`, `alignItems: "center"`.
    - **Brand/Logo Group:** Logo minimalista + Texto `"Min-URL"`.
    - **Auth Actions Group:** Botón Ghost `"Iniciar sesión"` + Botón Primary/CTA `"Registrarse"`.
  - **Hero Section (`desktop-hero`):** `role: "hero"`, `width: 1040`, `layout: "vertical"`, `alignItems: "center"`, `padding: [120, 0, 80, 0]`, `gap: 24`.
    - **Badge Decorativo:** `"✦ Laboratorio de Arquitectura Monolítica"` (Píldora pequeña, borde azul eléctrico, texto sutil).
    - **Headline (`text`):** `"Acorta. Comparte. Analiza."` (`fontSize: 48`, `fontWeight: 700`, `fill: "#F1F5F9"`, `textAlign: "center"`).
    - **Tagline (`text`):** `"URLs cortas con estadísticas y analíticas en tiempo real en un solo monolito."` (`fontSize: 16`, `fill: "#94A3B8"`, `textAlign: "center"`).
  - **Tool Card (Formulario Acortador - `desktop-tool-card`):** `role: "card"`, `width: 640`, `layout: "vertical"`, `padding: 24`, `cornerRadius: 12`, `fill: "rgba(255, 255, 255, 0.03)"`, `stroke: "rgba(255,255,255,0.08)"`, `effects: [shadow]`, `gap: 16`.
    - **Input Group:**
      - Label: `"Introduce tu URL larga"` (`fontSize: 13`, `fontWeight: 600`, `fill: "#F1F5F9"`).
      - Input Container: `layout: "horizontal"`, `alignItems: "center"`, `height: 48`, `padding: [0, 16]`, `cornerRadius: 8`, `stroke: "rgba(255,255,255,0.12)"`.
        - Icon: `LinkIcon` (azul).
        - Text Placeholder: `"https://tu-enlace-largo.com/seccion/articulo..."` (`fill: "#64748B"`).
    - **Button Submit (`tool-btn-submit`):** `width: "fill_container"`, `height: 48`, `fill: "#0056FF"`, `cornerRadius: 8`, `justifyContent: "center"`.
      - Text: `"Acortar Enlace"` (`fontSize: 15`, `fontWeight: 600`, `fill: "#FFFFFF"`).
  - **Footer minimalista (`desktop-footer`):** `role: "footer"`, `width: 1040`, `height: 80`, `layout: "horizontal"`, `justifyContent: "space_between"`, `alignItems: "center"`.
    - **Copyright:** `"© 2026 Min-URL. Todos los derechos reservados."`.
    - **GitHub Link:** Icono `GithubIcon` + Texto `"Ver en GitHub"`.

---

## Preguntas Abiertas e Iteración

> [!NOTE]
>
> 1. **¿Deseas que prepare también el estado de "Éxito" (tras acortar la URL) como una pantalla alternativa en OpenPencil?** Los requisitos indican que tras acortar se debe mostrar la URL acortada y botones para copiar/visitar.
> 2. **¿Configuro el editor en vivo (Puerto 7600) para que veas la renderización en tiempo real en tu app de OpenPencil en primer plano?** Si tienes la app abierta, podemos correrlo directamente contra el canvas "live" en vez de escribir solo en disco.

---

## Plan de Verificación

1. **Inserción y Generación del Archivo `.op`:**
   Generar el archivo en [designs/landing_page.op](file:///d:/Proyectos/Min-URL-monolith/designs/landing_page.op).
2. **Validación del Esquema del Documento:**
   Usar `openpencil-remote` para leer el árbol de nodos e inspeccionar que no existan errores de consistencia en el layout.
3. **Validación Visual:**
   Pedir al usuario que abra el archivo generado `designs/landing_page.op` en su aplicación OpenPencil para confirmar que cumple visualmente con lo esperado.
