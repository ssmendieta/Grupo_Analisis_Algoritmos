import {
  Brain,
  ChartColumnBig,
  Clock3,
  PlayCircle,
  Sparkles,
  Workflow,
} from "lucide-react";

const conceptos = [
  {
    title: "Secuencia finita",
    desc: "Un algoritmo es una lista ordenada de pasos que transforma entradas en un resultado claro.",
    icon: Workflow,
  },
  {
    title: "Eficiencia",
    desc: "No solo importa resolver el problema, también importa cuánto tarda y cuántos recursos consume.",
    icon: Clock3,
  },
  {
    title: "Análisis",
    desc: "La notación Big O nos ayuda a estimar cómo crece el costo del algoritmo a medida que el problema aumenta.",
    icon: ChartColumnBig,
  },
];

const recursos = [
  {
    title: "Introducción a los algoritmos",
    desc: "Video breve para reforzar la idea general de qué es un algoritmo y por qué importa en computación.",
    url: "https://youtu.be/f10jKIslSUY?si=_3pl4ySFTdXk6l4j",
  },
  {
    title: "¿Qué es un algoritmo y por qué debería importarte?",
    desc: "Otra referencia útil para explicar el concepto con ejemplos y una visión más divulgativa.",
    url: "https://youtu.be/HaLLqlGn78M?si=Tx2m4wzhgcqLQvvD",
  },
];

export default function AlgoInfo() {
  return (
    <div className="pb-16">
      <section className="mx-auto max-w-7xl px-4 pb-14 pt-14 sm:px-6 lg:px-8 lg:pt-20">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-100/10 bg-sky-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-sky-100/75">
              <Sparkles size={14} />
              Base conceptual
            </div>
            <h1 className="text-balance text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
              ¿Qué es un algoritmo y por qué lo analizamos?
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Los algoritmos son la base de la resolución sistemática de
              problemas en computación. Analizarlos permite comprender no solo
              cómo funcionan, sino también evaluar su eficiencia, complejidad y
              aplicabilidad en distintos contextos. Este enfoque es clave para
              seleccionar la mejor solución frente a múltiples alternativas.
            </p>
          </div>

          <div className="glass-panel cyber-shell rounded-[30px] p-6">
            <div className="rounded-[24px] border border-white/10 bg-slate-950/45 p-5">
              <div className="flex items-center gap-3 text-sky-100">
                <Brain size={20} />
                <h2 className="text-lg font-semibold">Idea central</h2>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                Un algoritmo es una secuencia finita de pasos bien definidos que
                transforma datos de entrada en resultados. Su estudio no se
                limita a que funcione correctamente, sino a cómo lo hace: cuánto
                tiempo tarda, cuántos recursos consume y qué tan bien se adapta
                a diferentes tamaños de problema.
              </p>
              <div className="mt-5 rounded-2xl border border-sky-100/10 bg-sky-300/10 px-4 py-3 text-sm text-sky-50/90">
                Un buen análisis permite comparar opciones, justificar
                decisiones y detectar cuándo una solución deja de ser
                conveniente.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {conceptos.map(({ title, desc, icon: Icon }) => (
            <article
              key={title}
              className="glass-panel cyber-shell rounded-[28px] p-6 transition hover:-translate-y-1 hover:border-sky-200/20"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-100/10 bg-sky-300/10 text-sky-100">
                <Icon size={20} />
              </div>
              <h3 className="text-xl font-semibold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="glass-panel cyber-shell rounded-[32px] p-6 sm:p-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="soft-title text-[11px] font-semibold text-sky-100/55">
                Apoyo audiovisual
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-white">
                Recursos para acompañar la explicación
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-300">
              Dejé esta sección más limpia para que luego puedas reemplazar
              miniaturas, gifs o imágenes por algo más alineado con la estética
              final sin romper el diseño.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {recursos.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() => window.open(item.url, "_blank")}
                className="group rounded-[26px] border border-white/10 bg-slate-950/45 p-5 text-left transition hover:-translate-y-1 hover:border-sky-200/20 hover:bg-slate-900/70"
              >
                <div className="mb-5 flex aspect-video items-center justify-center rounded-[20px] border border-sky-100/10 bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.28),_transparent_22%),linear-gradient(135deg,rgba(8,20,48,0.98),rgba(12,37,70,0.95))]">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-sky-100/15 bg-sky-300/15 text-sky-50 shadow-[0_0_30px_rgba(56,189,248,0.22)] transition group-hover:scale-105">
                    <PlayCircle size={28} />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white group-hover:text-sky-100">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {item.desc}
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
