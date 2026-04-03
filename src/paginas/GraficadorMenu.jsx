import { useNavigate } from "react-router-dom";
import { GitBranch, LayoutGrid, PenLine } from "lucide-react";

const TOOLS = [
  {
    id: "johnson",
    title: "Johnson",
    subtitle: "Rutas críticas y secuenciación",
    tool: "johnson",
    Icon: GitBranch,
    accent: "from-sky-500 to-blue-600",
    bar: "bg-sky-500/90",
    border: "border-sky-500/35",
    hover: "hover:border-sky-400/60 hover:shadow-[0_0_0_1px_rgba(56,189,248,0.35)]",
  },
  {
    id: "asignacion",
    title: "Asignación",
    subtitle: "Algoritmo húngaro · min / max",
    tool: "asignacion",
    Icon: LayoutGrid,
    accent: "from-emerald-500 to-teal-600",
    bar: "bg-emerald-500/90",
    border: "border-emerald-500/35",
    hover: "hover:border-emerald-400/60 hover:shadow-[0_0_0_1px_rgba(52,211,153,0.35)]",
  },
  {
    id: "editor",
    title: "Graficador",
    subtitle: "Dibuja y edita el grafo libremente",
    tool: "editor",
    Icon: PenLine,
    accent: "from-violet-500 to-indigo-600",
    bar: "bg-violet-500/90",
    border: "border-violet-500/35",
    hover: "hover:border-violet-400/60 hover:shadow-[0_0_0_1px_rgba(167,139,250,0.35)]",
  },
];

export default function GraficadorMenu() {
  const navigate = useNavigate();

  const go = (tool) => {
    if (tool === "editor") {
      navigate("/graficador/editor");
    } else {
      navigate(`/graficador/editor?tool=${encodeURIComponent(tool)}`);
    }
  };

  return (
    <div className="min-h-[calc(100vh-57px)] bg-[#060b14] text-slate-100">
      <div className="mx-auto max-w-5xl px-5 py-12 sm:py-16 md:py-20">
        <header className="mb-10 md:mb-14 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-slate-500 mb-2">
            Herramientas
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Graficador
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            Elige una opción. Cada recuadro abre el mismo lienzo con el flujo indicado.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              type="button"
              onClick={() => go(tool.tool)}
              className={`
                group text-left rounded-2xl border bg-[#0d1117] overflow-hidden
                transition-all duration-200 ease-out
                focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060b14] focus-visible:ring-white/30
                ${tool.border} ${tool.hover}
                hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/40
              `}
            >
              <div
                className={`h-2 w-full bg-gradient-to-r ${tool.accent} opacity-90 group-hover:opacity-100 transition-opacity`}
              />
              <div className="p-6 sm:p-7 flex flex-col min-h-[200px] sm:min-h-[220px]">
                <div
                  className={`inline-flex items-center justify-center w-11 h-11 rounded-xl mb-4 ${tool.bar} text-white shadow-lg shadow-black/20`}
                >
                  <tool.Icon size={22} strokeWidth={2.2} />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight mb-1">
                  {tool.title}
                </h2>
                <p className="text-sm text-slate-400 leading-snug flex-1">
                  {tool.subtitle}
                </p>
                <div className="mt-5 pt-4 border-t border-white/6 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Abrir
                  </span>
                  <span className="text-slate-400 group-hover:text-white transition-colors text-lg leading-none">
                    →
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
