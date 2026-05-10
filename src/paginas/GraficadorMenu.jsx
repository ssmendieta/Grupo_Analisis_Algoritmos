import { useNavigate } from "react-router-dom";
import {
  Boxes,
  GitBranch,
  Grid2x2Plus,
  MoveRight,
  PackageOpen,
  ArrowDown01,
  Network,
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
  {
    id: "sorts",
    title: "Sorts",
    subtitle:
      "Visualización de ordenamiento: Selection, Insertion, Merge y Shell.",
    tool: "sorts",
    Icon: ArrowDown01,
  },
  {
    id: "binaryTree",
    title: "Árbol Binario",
    subtitle:
      "Inserción, recorridos (inorder, preorder, postorder) y reconstrucción de árboles BST.",
    tool: "binaryTree",
    Icon: Network,
  },
];

export default function GraficadorMenu() {
  const navigate = useNavigate();

  const handleNavigation = (tool) => {
    if (tool === "sorts") {
      // Si es sorts, vamos a la ruta exclusiva de sorts
      navigate("/graficador/sorts");
    } else if (tool === "editor") {
      // Si es el editor libre
      navigate("/graficador/editor");
    } else if (tool === "binaryTree") {
      navigate("/graficador/binary-tree");
    } else {
      // Para los demás (Johnson, Northwest, etc.) usamos parámetros
      navigate(`/graficador/editor?tool=${tool}`);
    }
  };

  return (
    <div className="pb-16 pt-12 bg-[#060c1c] min-h-screen">
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="glass-panel cyber-shell overflow-hidden rounded-[34px] p-6 sm:p-8 lg:p-10 border border-white/5 bg-slate-900/10 backdrop-blur-md">
          <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
            <div>
              <p className="soft-title text-[11px] font-semibold text-sky-100/55 uppercase tracking-widest">
                Menú de algoritmos
              </p>
              <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">
                Explora y aplica algoritmos en entornos interactivos.
              </h1>
            </div>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {TOOLS.map(({ id, title, subtitle, tool, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleNavigation(tool)}
                className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/40 p-5 text-left transition hover:-translate-y-1 hover:border-sky-200/20"
              >
                <div className="relative flex h-full flex-col">
                  <div className="mb-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-100/10 bg-sky-300/10 text-sky-50 shadow-lg">
                    <Icon size={22} />
                  </div>
                  <h2 className="text-2xl font-semibold text-white">{title}</h2>
                  <p className="mt-3 flex-1 text-sm leading-6 text-slate-400">
                    {subtitle}
                  </p>
                  <div className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-sky-100 transition group-hover:gap-3">
                    Abrir herramienta <MoveRight size={16} />
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
