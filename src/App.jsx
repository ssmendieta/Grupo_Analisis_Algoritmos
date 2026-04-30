import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useMemo, useState } from "react";
import { Code2, HelpCircle, Sparkles, X } from "lucide-react";
import Graficador from "./paginas/Graficador";
import GraficadorMenu from "./paginas/GraficadorMenu";
import AnalisisInfo from "./paginas/AlgoInfo";
import PaginaInicio from "./paginas/PaginaInicio";
import Matriz from "./paginas/Matriz";
import SortsPage from "./paginas/Sorts"; // <--- IMPORTANTE: Importamos la nueva página
import "./App.css";

const HELP_CONTENT = {
  sorts: { // <--- Nueva guía de ayuda para Sorts
    title: "Ordenamiento · guía rápida",
    badge: "Algoritmos de Sort",
    steps: [
      "Ingresa los números separados por comas en el campo de texto.",
      "Presiona 'Generar' para crear los rectángulos visuales.",
      "Selecciona un algoritmo (Selection, Insertion o Shell) para iniciar.",
      "Observa el panel lateral para ver el registro de cada intercambio.",
    ],
  },
  johnson: {
    title: "Johnson · guía rápida",
    badge: "Ruta crítica",
    steps: [
      "Haz doble clic en el lienzo para crear nodos.",
      "Toca un nodo y luego otro para conectar origen y destino.",
      "Usa clic derecho solo para renombrar o eliminar si lo necesitas.",
      "El botón Johnson calcula early, late y marca la ruta crítica.",
    ],
  },
  asignacion: {
    title: "Asignación · guía rápida",
    badge: "Recursos y tareas",
    steps: [
      "Ubica recursos a la izquierda y tareas a la derecha.",
      "Conecta nodos compatibles y asigna sus pesos.",
      "Si hay más recursos o tareas, el sistema añade ficticios automáticamente.",
      "Ejecuta Asignación para ver la solución mínima o máxima.",
    ],
  },
  northwest: {
    title: "Northwest · guía rápida",
    badge: "Transporte",
    steps: [
      "Prepara orígenes, destinos, oferta y demanda.",
      "Ingresa los costos de transporte correctamente.",
      "Usa la ayuda del algoritmo para revisar el flujo paso a paso.",
      "Luego podrás revisar la solución y la serie de iteraciones.",
    ],
  },
  editor: {
    title: "Graficador · guía rápida",
    badge: "Edición libre",
    steps: [
      "Doble clic crea nodos nuevos.",
      "Un clic selecciona el nodo origen; otro clic crea la conexión.",
      "Arrastra para reposicionar nodos.",
      "Exporta e importa tu grafo desde el panel superior.",
    ],
  },
};

// Modificamos esta función para que reconozca la ruta de sorts
function getHelpForLocation(pathname, search) {
  if (pathname === "/graficador/sorts") return HELP_CONTENT.sorts; // <--- Ayuda directa para Sorts
  if (pathname !== "/graficador/editor") return null;
  
  const params = new URLSearchParams(search);
  const tool = params.get("tool") || "editor";
  return HELP_CONTENT[tool] || HELP_CONTENT.editor;
}

function NavBar() {
  const location = useLocation();
  const [showHelp, setShowHelp] = useState(false);
  const help = getHelpForLocation(location.pathname, location.search);

  const items = useMemo(
    () => [
      { to: "/paginaInicio", label: "Inicio" },
      { to: "/algoritmos", label: "¿Qué es un algoritmo?" },
      { to: "/graficador", label: "Algoritmos" },
    ],
    [],
  );

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-sky-100/10 bg-slate-950/70 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/paginaInicio" className="group flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-200/15 bg-sky-400/10 text-sky-200 shadow-[0_0_30px_rgba(56,189,248,0.12)] transition group-hover:scale-[1.03] group-hover:bg-sky-400/15">
              <Code2 size={20} />
            </div>
            <div className="hidden sm:block">
              <p className="soft-title text-[10px] font-semibold text-sky-200/60">
                Proyecto visual
              </p>
              <p className="text-sm font-semibold text-white">
                Análisis de Algoritmos
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 md:flex">
            {items.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-sky-300/15 text-sky-100 shadow-[0_0_24px_rgba(56,189,248,0.18)]"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {help && (
              <button
                onClick={() => setShowHelp(true)}
                className="inline-flex items-center gap-2 rounded-full border border-sky-200/10 bg-sky-300/10 px-4 py-2 text-sm font-medium text-sky-100 transition hover:border-sky-200/20 hover:bg-sky-300/15"
              >
                <HelpCircle size={16} />
                Ayuda
              </button>
            )}
          </div>
        </nav>
      </header>

      {showHelp && help && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="glass-panel cyber-shell w-full max-w-lg rounded-[28px] p-6 sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-sky-200/10 bg-sky-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-100/80">
                  <Sparkles size={12} />
                  {help.badge}
                </div>
                <h2 className="text-xl font-semibold text-white">
                  {help.title}
                </h2>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              {help.steps.map((step, index) => (
                <div
                  key={step}
                  className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3"
                >
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-100/55">
                    Paso {index + 1}
                  </p>
                  <p className="text-sm leading-6 text-slate-200">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Navigate to="/paginaInicio" replace />} />
        <Route path="/paginaInicio" element={<PaginaInicio />} />
        <Route path="/algoritmos" element={<AnalisisInfo />} />
        <Route path="/graficador" element={<GraficadorMenu />} />
        <Route path="/graficador/editor" element={<Graficador />} />
        <Route path="/graficador/sorts" element={<SortsPage />} /> {/* <--- RUTA PARA SORTS */}
        <Route path="/matriz" element={<Matriz />} />
      </Routes>
    </Router>
  );
}