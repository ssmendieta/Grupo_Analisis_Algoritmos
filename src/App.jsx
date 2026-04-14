import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';  
import Graficador from './paginas/Graficador'
import GraficadorMenu from './paginas/GraficadorMenu'
import AnalisisInfo from './paginas/AlgoInfo'
import PaginaIncio from './paginas/PaginaInicio';
import Matriz from './paginas/Matriz'
import { useState } from 'react';
import { Code } from 'lucide-react';

// Contenido de ayuda por ruta/tool
const HELP_CONTENT = {
  johnson: {
    title: "Johnson — Cómo usar",
    color: "text-sky-400",
    steps: [
      { icon: '🖱️', action: 'Doble clic', desc: 'en el canvas para crear un nodo' },
      { icon: '🔗', action: 'Conectar', desc: 'clic derecho sobre un nodo → Conectar, luego clic en el destino' },
      { icon: '⚖️', action: 'Pesos', desc: 'representan la duración de cada actividad' },
      { icon: '▶', action: 'Botón Johnson', desc: 'calcula tiempos early/late y marca la ruta crítica en rojo' },
      { icon: '📊', action: 'Nodos resultado', desc: 'muestran [early | late]; la holgura es late − early' },
    ],
  },
  asignacion: {
    title: "Asignación — Cómo usar",
    color: "text-emerald-400",
    steps: [
      { icon: '◀', action: 'Lado izquierdo', desc: 'coloca aquí los nodos de recursos (trabajadores, máquinas)' },
      { icon: '▶', action: 'Lado derecho', desc: 'coloca aquí los nodos de tareas' },
      { icon: '🔗', action: 'Conectar', desc: 'une cada recurso con sus tareas posibles y asigna un peso (costo o beneficio)' },
      { icon: '⚠️', action: 'Matriz no cuadrada', desc: 'si hay distinto número de recursos y tareas se agregan ficticios automáticamente' },
      { icon: '▶', action: 'Botón Asignación', desc: 'elige minimizar costo o maximizar beneficio; las aristas verdes muestran la solución' },
    ],
  },
  editor: {
    title: "Graficador — Cómo usar",
    color: "text-violet-400",
    steps: [
      { icon: '🖱️', action: 'Doble clic', desc: 'en el canvas para crear un nodo' },
      { icon: '📋', action: 'Clic derecho', desc: 'sobre un nodo para conectar, renombrar o eliminar' },
      { icon: '✏️', action: 'Aristas', desc: 'clic derecho sobre una arista para editar su peso' },
      { icon: '✋', action: 'Arrastrar', desc: 'mantén presionado y mueve para reposicionar nodos' },
      { icon: '💾', action: 'Guardar', desc: 'exporta el grafo como JSON e impórtalo para restaurarlo' },
    ],
  },
};

function getHelpForLocation(pathname, search) {
  if (pathname === '/graficador/editor') {
    const params = new URLSearchParams(search);
    const tool = params.get('tool');
    if (tool === 'johnson') return HELP_CONTENT.johnson;
    if (tool === 'asignacion') return HELP_CONTENT.asignacion;
    return HELP_CONTENT.editor;
  }
  return null; // en otras rutas no hay botón
}

function NavBar() {
  const location = useLocation();
  const [showHelp, setShowHelp] = useState(false);
  const help = getHelpForLocation(location.pathname, location.search);

  return (
    <>
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/5 bg-[#0a0c14] backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="bg-blue-600 p-1.5 rounded-lg group-hover:bg-blue-500 transition-colors">
            <Code size={20} className="text-white" />
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <Link to="/paginaInicio" className="text-white hover:text-blue-400">Inicio</Link>
          <Link to="/algoritmos" className="text-white hover:text-blue-400">¿Qué es un algoritmo?</Link>
          <Link to="/graficador" className="text-white hover:text-blue-400">Algoritmos</Link>
        </div>

        <div className="flex items-center gap-4">
          {help && (
            <button
              onClick={() => setShowHelp(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              <span className="w-4 h-4 rounded-full border border-gray-500 flex items-center justify-center text-[10px] font-black">?</span>
              Ayuda
            </button>
          )}
        </div>
      </nav>

      {/* Panel de ayuda */}
      {showHelp && help && (
        <div
          className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="bg-[#0d1117] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className={`font-bold text-sm ${help.color}`}>{help.title}</h2>
              <button
                onClick={() => setShowHelp(false)}
                className="text-gray-500 hover:text-white transition-colors text-lg leading-none"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              {help.steps.map((step, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-lg bg-white/3 border border-white/5">
                  <span className="text-base flex-shrink-0">{step.icon}</span>
                  <div>
                    <span className={`text-xs font-bold ${help.color}`}>{step.action} </span>
                    <span className="text-xs text-gray-400">{step.desc}</span>
                  </div>
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
        <Route path="/algoritmos" element={<AnalisisInfo />} />
        <Route path="/graficador" element={<GraficadorMenu />} />
        <Route path="/graficador/editor" element={<Graficador />} />
        <Route path="/paginaInicio" element={<PaginaIncio />} />
        <Route path="/matriz" element={<Matriz />} />
      </Routes>
    </Router>
  );
}