import { ArrowRight, Bot, Flower2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const integrantes = [
  "Grupo Cameyoshi:",
  "Sergio Mendieta",
  "Andrea Narváez",
  "Gemina Ponce",
];

export default function PaginaInicio() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[36rem] bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.24),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(125,211,252,0.16),_transparent_26%)]" />
      <div className="absolute -left-20 top-40 h-72 w-72 rounded-full bg-sky-300/10 blur-[120px]" />
      <div className="absolute -right-16 bottom-20 h-80 w-80 rounded-full bg-blue-500/12 blur-[140px]" />

      <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-20">
        <div className="relative z-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-100/10 bg-sky-200/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-sky-100/80">
            <Flower2 size={14} />
            Proyecto en grupo Análsis de Algoritmos
          </div>

          <h1 className="text-balance max-w-3xl text-5xl font-semibold leading-tight text-white sm:text-6xl lg:text-7xl">
            Una experiencia más clara para explorar algoritmos.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Esta plataforma está diseñada para facilitar la comprensión y
            visualización de algoritmos clásicos de optimización. A través de
            una interfaz interactiva, el usuario puede construir grafos,
            analizar estructuras y observar el comportamiento de distintos
            métodos de resolución paso a paso.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              to="/graficador"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-sky-200/15 bg-sky-300/15 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_32px_rgba(56,189,248,0.18)] transition hover:-translate-y-0.5 hover:bg-sky-300/20"
            >
              Iniciar recorrido
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/algoritmos"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
            >
              Ver introducción
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="glass-panel cyber-shell rounded-[24px] p-5">
              <p className="soft-title text-[11px] font-semibold text-sky-100/55">
                Equipo
              </p>
              <div className="mt-3 space-y-2 text-sm text-slate-200">
                {integrantes.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel cyber-shell rounded-[24px] p-5">
              <p className="soft-title text-[11px] font-semibold text-sky-100/55">
                Enfoque
              </p>
              <div className="mt-3 space-y-3 text-sm leading-6 text-slate-300">
                <div className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                  <Sparkles size={16} className="mt-1 shrink-0 text-sky-200" />
                  El aprendizaje de algoritmos se potencia cuando se combina
                  teoría con visualización. Por ello, esta herramienta permite
                  representar problemas de forma gráfica, ayudando a interpretar
                  mejor las relaciones, decisiones y resultados.
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                  <Bot size={16} className="mt-1 shrink-0 text-sky-200" />
                  Se prioriza una experiencia clara y estructurada, donde cada
                  acción del usuario tiene una representación visual directa
                  dentro del sistema.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="glass-panel cyber-shell relative overflow-hidden rounded-[32px] p-5 sm:p-6">
            <div className="absolute left-5 top-5 h-24 w-24 rounded-full bg-sky-300/10 blur-3xl" />
            <div className="absolute bottom-10 right-8 h-28 w-28 rounded-full bg-blue-400/10 blur-3xl" />

            <div className="grid gap-4 sm:grid-cols-[0.88fr_1.12fr]">
              <div className="relative min-h-[360px] overflow-hidden rounded-[26px] border border-sky-100/10 bg-[linear-gradient(180deg,rgba(240,248,255,0.08),rgba(10,18,40,0.65))]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_24%,rgba(255,255,255,0.25),transparent_20%),radial-gradient(circle_at_70%_65%,rgba(125,211,252,0.22),transparent_18%)]" />
                <div className="absolute inset-y-0 left-0 w-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)] opacity-60" />
                <div className="absolute inset-5 rounded-[22px] border border-white/10" />
                <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 backdrop-blur-sm">
                  <p className="soft-title text-[10px] text-sky-100/50">
                    Visualización
                  </p>
                  <p className="mt-1 text-sm text-slate-200">
                    La representación visual permite identificar patrones,
                    caminos críticos y asignaciones óptimas de manera más
                    intuitiva, reduciendo la complejidad que suele presentarse
                    en el análisis teórico.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="rounded-[26px] border border-white/10 bg-white/5 p-5">
                  <p className="soft-title text-[10px] text-sky-100/50">
                    Secciones
                  </p>
                  <div className="mt-4 grid gap-3 text-sm text-slate-200">
                    {["Inicio", "¿Qué es un algoritmo?", "Algoritmos"].map(
                      (item) => (
                        <div
                          key={item}
                          className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3"
                        >
                          {item}
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <div className="rounded-[26px] border border-sky-200/10 bg-sky-300/10 p-5">
                  <p className="soft-title text-[10px] text-sky-100/50">
                    Objetivo
                  </p>
                  <p className="mt-3 text-sm leading-7 text-sky-50/90">
                    Brindar una herramienta interactiva que apoye el aprendizaje
                    de algoritmos mediante la visualización de procesos y
                    resultados, permitiendo al usuario comprender cada paso de
                    la resolución.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
