# Min-URL Monolith 🔬

Este proyecto es un **acortador de URLs monolítico** construido con Next.js (App Router) y Bun.

> [!NOTE]
> **Propósito de Laboratorio:** Este repositorio no está diseñado como una aplicación convencional, sino como un **entorno experimental de pruebas de estrés e instrumentación** para comparar el comportamiento, rendimiento y observabilidad de una arquitectura monolítica frente a una arquitectura distribuida (microservicios).

## Alcance actual

- **UC-01 — Crear short URL anónima:** implementado. Cualquier visitante acorta una URL vía `POST /api/links` sin registrarse.
- **UC-02 — Redirigir y contar clics:** implementado. `GET /:shortCode` responde 302 y registra el clic en `link_visits`.
- **Fuera de alcance:** autenticación, dashboard, analytics y alias personalizados han sido descartados.
- **Observabilidad (el norte del lab):** Prometheus, Grafana, Loki y K6 se añadirán en una fase posterior a la de UX/UI.

## Enfoque del Proyecto

- **Medición y Rendimiento:** El foco principal es la recolección de métricas bajo carga extrema utilizando scripts de **K6**.
- **Observabilidad integrada:** Próximamente se incorporará instrumentación con Prometheus (métricas), Grafana (paneles de control) y Loki (logs estructurados) para monitorizar el comportamiento del sistema en tiempo real.
- **Stack Minimalista:** Diseñado para correr de forma optimizada dentro de contenedores Docker con recursos de hardware limitados.

---

_Nota: Este es un README provisional para el inicio del proyecto. Se irá iterando y reescribiendo a lo largo de las fases del laboratorio._
