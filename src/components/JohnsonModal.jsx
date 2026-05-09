import { useMemo, useState } from "react";
import { X, Minimize2, Maximize2, Info, Check } from "lucide-react";
import { runJohnson } from "../utils/johnson";
import { runCPM } from "../utils/cpm";

import {
  overlayStyle,
  modalStyle,
  headerStyle,
  closeBtnStyle,
  subtitleStyle,
  cardsWrapStyle,
  cardBtnStyle,
  cardTitleStyle,
  cardTextStyle,
  secondaryBtnStyle,
  primaryBtnStyle,
  footerActionsStyle,
  labelStyle,
  selectStyle,
  errorStyle,
  iconCircleStyle,
  resultTitleStyle,
  resultSubStyle,
  distanceStyle
} from "../styles/js/johnsonModalStyles.js";
export default function JohnsonModal({
  open,
  onClose,
  nodes,
  edges,
  isDirected,
  hasWeights,
  onApplyResult,
}) {
  const [step, setStep] = useState("menu");
  const [source, setSource] = useState("");
  const [target, setTarget] = useState("");
  const [error, setError] = useState("");
  const [finalResult, setFinalResult] = useState(null);

  const nodeOptions = useMemo(
    () => nodes.map((n) => ({ value: n.id, label: n.label || String(n.id) })),
    [nodes],
  );

  if (!open) return null;

  const resetAll = () => {
    setStep("menu");
    setSource("");
    setTarget("");
    setError("");
    setFinalResult(null);
    onClose();
  };

  const goMinimize = () => {
    setError("");
    setFinalResult(null);
    setSource("");
    setTarget("");
    setStep("min-source");
  };

  const goMaximize = () => {
    try {
      setError("");

      const result = runCPM(nodes, edges, isDirected, hasWeights);

      onApplyResult({
        mode: "max",
        duration: result.duration,
        nodes: result.nodes,
        edges: result.edges,
        criticalEdges: result.criticalEdges,
        highlightPath: [],
      });

      setFinalResult({
        title: "¡Ruta Crítica (CPM)!",
        subtitle: `D: ${result.duration}`,
        text: "La ruta crítica está resaltada.",
        type: "success",
      });

      setStep("result-max");
    } catch (err) {
      setError(err.message || "No se pudo ejecutar CPM.");
    }
  };

  const continueToTarget = () => {
    if (source === "") {
      setError("Selecciona un nodo origen.");
      return;
    }
    setError("");
    setStep("min-target");
  };

  const runMinimize = () => {
    try {
      if (source === "") {
        throw new Error("Selecciona un nodo origen.");
      }

      const numericSource = Number(source);
      const numericTarget =
        target === "" || target === "none" ? null : Number(target);

      const johnson = runJohnson(nodes, edges, isDirected, hasWeights);

      let highlightPath = [];
      let summary = null;

      if (numericTarget !== null) {
        const distance = johnson.distances[numericSource][numericTarget];
        const path = johnson.getPath(numericSource, numericTarget);

        if (distance === Infinity || !path.length) {
          throw new Error("No existe camino entre el origen y el destino.");
        }

        highlightPath = path;
        summary = {
          from: numericSource,
          to: numericTarget,
          distance,
        };
      }

      onApplyResult({
        mode: "min",
        nodes: nodes.map((n) => ({
          ...n,
          early:
            johnson.distances[numericSource][n.id] === Infinity
              ? "-"
              : johnson.distances[numericSource][n.id],
          late:
            johnson.distances[numericSource][n.id] === Infinity
              ? "-"
              : johnson.distances[numericSource][n.id],
          critical: highlightPath.includes(n.id),
        })),
        edges: edges.map((e) => {
          const inPath = isEdgeInPath(e, highlightPath);
          return {
            ...e,
            slack: inPath ? 0 : "-",
            critical: false,
            highlighted: inPath,
          };
        }),
        duration: summary ? summary.distance : 0,
        highlightPath,
      });

      if (summary) {
        setFinalResult({
          title: "Camino más corto",
          subtitle: `${getNodeName(summary.from, nodes)} → ${getNodeName(summary.to, nodes)}`,
          text: `Distancia: ${summary.distance}`,
          type: "info",
        });
      } else {
        setFinalResult({
          title: "Camino mínimo",
          subtitle: `${getNodeName(numericSource, nodes)}`,
          text: "Se calcularon las distancias desde el origen.",
          type: "info",
        });
      }

      setStep("result-min");
      setError("");
    } catch (err) {
      setError(err.message || "No se pudo ejecutar Johnson.");
    }
  };

  return (
    <div onClick={resetAll} style={overlayStyle}>
      <div onClick={(e) => e.stopPropagation()} style={modalStyle}>
        <div style={headerStyle}>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
            {step === "menu" && "Johnson"}
            {step === "min-source" && "Camino mínimo"}
            {step === "min-target" && "¿Destino?"}
            {step === "result-min" && ""}
            {step === "result-max" && ""}
          </h2>
          <button onClick={resetAll} style={closeBtnStyle}>
            <X size={18} />
          </button>
        </div>

        {step === "menu" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={iconCircleStyle}>
                <Info size={40} color="#60a5fa" />
              </div>
            </div>

            <p style={subtitleStyle}>Elige qué quieres hacer con el grafo.</p>

            <div style={cardsWrapStyle}>
              <button onClick={goMinimize} style={cardBtnStyle}>
                <Minimize2 size={22} />
                <div>
                  <div style={cardTitleStyle}>Minimizar</div>
                  <div style={cardTextStyle}>
                    Encuentra el camino más corto y resáltalo.
                  </div>
                </div>
              </button>

              <button onClick={goMaximize} style={cardBtnStyle}>
                <Maximize2 size={22} />
                <div>
                  <div style={cardTitleStyle}>Maximizar</div>
                  <div style={cardTextStyle}>
                    Encuentra la Ruta Crítica (CPM) y holguras.
                  </div>
                </div>
              </button>
            </div>

            {error && <p style={errorStyle}>{error}</p>}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 18,
              }}
            >
              <button onClick={resetAll} style={secondaryBtnStyle}>
                Cerrar
              </button>
            </div>
          </>
        )}

        {step === "min-source" && (
          <>
            <p style={subtitleStyle}>
              Selecciona origen y, si quieres, un destino para resaltar el
              camino.
            </p>

            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={labelStyle}>Origen</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  style={selectStyle}
                >
                  <option value="">— seleccionar —</option>
                  {nodeOptions.map((n) => (
                    <option key={n.value} value={n.value}>
                      {n.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && <p style={errorStyle}>{error}</p>}

            <div style={footerActionsStyle}>
              <button onClick={() => setStep("menu")} style={secondaryBtnStyle}>
                Volver
              </button>
              <button onClick={continueToTarget} style={primaryBtnStyle}>
                Continuar
              </button>
            </div>
          </>
        )}

        {step === "min-target" && (
          <>
            <p style={subtitleStyle}>Selecciona un destino opcional.</p>

            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={labelStyle}>Destino</label>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  style={selectStyle}
                >
                  <option value="none">(ninguno)</option>
                  {nodeOptions.map((n) => (
                    <option key={n.value} value={n.value}>
                      {n.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && <p style={errorStyle}>{error}</p>}

            <div style={footerActionsStyle}>
              <button
                onClick={() => setStep("min-source")}
                style={secondaryBtnStyle}
              >
                Volver
              </button>
              <button onClick={runMinimize} style={primaryBtnStyle}>
                Ejecutar
              </button>
            </div>
          </>
        )}

        {(step === "result-min" || step === "result-max") && finalResult && (
          <>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div
                style={{
                  ...iconCircleStyle,
                  borderColor:
                    finalResult.type === "success" ? "#bbf7d0" : "#67e8f9",
                }}
              >
                {finalResult.type === "success" ? (
                  <Check size={42} color="#84cc16" />
                ) : (
                  <Info size={42} color="#60a5fa" />
                )}
              </div>
            </div>

            <h3 style={resultTitleStyle}>{finalResult.title}</h3>
            <p style={resultSubStyle}>{finalResult.subtitle}</p>
            <p style={distanceStyle}>{finalResult.text}</p>

            <div style={footerActionsStyle}>
              <button onClick={resetAll} style={primaryBtnStyle}>
                OK
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function getNodeName(id, nodes) {
  const node = nodes.find((n) => n.id === id);
  return node?.label || String(id);
}

function isEdgeInPath(edge, path) {
  if (!path || path.length < 2) return false;
  for (let i = 0; i < path.length - 1; i++) {
    if (path[i] === edge.from && path[i + 1] === edge.to) return true;
  }
  return false;
}
