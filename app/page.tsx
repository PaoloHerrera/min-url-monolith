import { Activity, Container, Zap } from 'lucide-react'

import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { ToolCard } from '@/components/ToolCard'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const FEATURES = [
  {
    icon: Zap,
    title: 'Rendimiento In-Process',
    description:
      'Base de datos SQLite nativa en Bun (`bun:sqlite`). Consultas en microsegundos sin latencia de red ni sockets TCP.',
  },
  {
    icon: Activity,
    title: 'Observabilidad Integrada',
    description:
      'Métricas nativas estructuradas de Prometheus y logs de Loki para analizar latencias (p95/p99) y RPS en tiempo real.',
  },
  {
    icon: Container,
    title: 'Contención de Recursos',
    description:
      'Despliegue bajo Docker limitado a 1 CPU y 512MB RAM para estresar el rendimiento del monolito bajo cargas extremas.',
  },
]

export default function Home() {
  return (
    <div className="bg-background relative flex min-h-screen flex-col">
      <a
        href="#main"
        className="bg-primary text-primary-foreground focus-visible:ring-ring sr-only z-60 rounded-md px-4 py-2 text-sm font-semibold focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:outline-none focus-visible:ring-2"
      >
        Saltar al contenido
      </a>

      <Navbar />

      <main
        id="main"
        className="relative flex flex-1 flex-col items-center overflow-hidden px-6 pt-28 pb-4 md:pt-36"
      >
        {/* ── Fondos Decorativos Premium (Glows & Grid) ── */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-size-[4rem_4rem]"
        />
        <div
          aria-hidden="true"
          className="from-primary/10 pointer-events-none absolute top-0 left-1/2 -z-10 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-linear-to-r to-indigo-600/10 blur-[80px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/3 right-1/4 -z-10 h-[250px] w-[250px] rounded-full bg-purple-600/5 blur-[60px]"
        />

        <div className="flex w-full max-w-4xl flex-col items-center gap-12 md:gap-16">
          {/* ── Hero ── */}
          <section className="flex flex-col items-center text-center">
            <Badge variant="default">
              <span aria-hidden="true" className="bg-primary h-2 w-2 animate-pulse rounded-full" />
              LABORATORIO DE RENDIMIENTO SRE
            </Badge>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl">
              <span className="bg-linear-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Min-URL Monolith
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-lg leading-relaxed text-(--text-secondary)">
              Acorta y comparte URLs sin registrarte; redirige y cuenta clics. Un acortador
              optimizado para pruebas de estrés extremas que evalúa la latencia, concurrencia y
              límites del hardware en un solo contenedor.
            </p>
          </section>

          {/* ── Tool Card (create flow) ── */}
          <ToolCard />

          {/* ── Bento Grid de Características ── */}
          <section
            aria-label="Características del laboratorio"
            className="grid w-full grid-cols-1 gap-6 sm:grid-cols-3"
          >
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="glass-panel-hover">
                <CardContent className="flex flex-col gap-3 p-6">
                  <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg font-bold">
                    <Icon data-icon className="size-5" />
                  </span>
                  <h3 className="text-foreground text-base font-semibold">{title}</h3>
                  <p className="text-sm leading-relaxed text-(--text-muted)">{description}</p>
                </CardContent>
              </Card>
            ))}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
