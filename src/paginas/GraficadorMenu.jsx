import { useNavigate } from "react-router-dom";
import {
  Boxes,
  GitBranch,
  Grid2x2Plus,
  MoveRight,
  PackageOpen,
} from "lucide-react";

const TOOLS = [
  {
    id: "johnson",
    title: "Johnson",
    subtitle: "Ruta crítica, tiempos early y late.",
    tool: "johnson",
    Icon: GitBranch,
  },
  {
    id: "asignacion",
    title: "Asignación",
    subtitle: "Recursos, tareas y solución óptima.",
    tool: "asignacion",
    Icon: Grid2x2Plus,
  },
  {
    id: "northwest",
    title: "Northwest",
    subtitle: "Problema de transporte y costos.",
    tool: "northwest",
    Icon: PackageOpen,
  },
  {
    id: "editor",
    title: "Graficador libre",
    subtitle: "Modo manual para crear y editar grafos.",
    tool: "editor",
    Icon: Boxes,
  },
];

export default function GraficadorMenu() {
  const navigate = useNavigate();

  return (
    <div className="pb-16 pt-12">
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="glass-panel cyber-shell overflow-hidden rounded-[34px] p-6 sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
            <div>
              <p className="soft-title text-[11px] font-semibold text-sky-100/55">
                Menú de algoritmos
              </p>
              <h1 className="mt-3 text-balance text-4xl font-semibold text-white sm:text-5xl">
                Explora y aplica algoritmos en entornos interactivos.{" "}
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
                Cada módulo representa un tipo de problema clásico en el
                análisis de algoritmos. Aquí podrás construir, visualizar y
                resolver casos reales, comprendiendo paso a paso cómo cada
                técnica transforma los datos hasta llegar a una solución.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-slate-950/45 p-5 text-sm leading-7 text-slate-300">
              <p className="soft-title text-[10px] text-sky-100/50">Nota</p>
              <p className="mt-2">
                Este entorno está diseñado para que experimentes con distintos
                algoritmos y compares sus resultados. Podrás modificar entradas,
                observar su comportamiento y analizar cómo influyen factores
                como costos, restricciones y estructuras del problema.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {TOOLS.map(({ id, title, subtitle, tool, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() =>
                  navigate(
                    tool === "editor"
                      ? "/graficador/editor"
                      : `/graficador/editor?tool=${tool}`,
                  )
                }
                className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,40,0.92),rgba(6,12,28,0.95))] p-5 text-left transition hover:-translate-y-1 hover:border-sky-200/20 hover:shadow-[0_16px_48px_rgba(4,12,28,0.55)]"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-200/60 to-transparent opacity-60" />
                <div className="absolute -right-14 top-0 h-32 w-32 rounded-full bg-sky-300/10 blur-3xl transition group-hover:bg-sky-300/20" />
                <div className="relative flex h-full flex-col">
                  <div className="mb-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-100/10 bg-sky-300/10 text-sky-50 shadow-[0_0_30px_rgba(56,189,248,0.14)]">
                    <Icon size={22} />
                  </div>
                  <h2 className="text-2xl font-semibold text-white">{title}</h2>
                  <p className="mt-3 flex-1 text-sm leading-7 text-slate-300">
                    {subtitle}
                  </p>
                  <div className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-sky-100 transition group-hover:gap-3">
                    Abrir herramienta
                    <MoveRight size={16} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
