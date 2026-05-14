import { useState } from "react";
import { Check, Info, Maximize2, Minimize2, X } from "lucide-react";
import { buildKruskalGraphResult, runKruskal } from "../utils/kruskal";

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
  errorStyle,
  iconCircleStyle,
  resultTitleStyle,
  resultSubStyle,
  distanceStyle,
} from "../styles/js/johnsonModalStyles.js";

export default function KruskalModal({ open, onClose, nodes, edges, onApplyResult }) {
  const [step, setStep] = useState("menu");
  const [error, setError] = useState("");
  const [finalResult, setFinalResult] = useState(null);

  if (!open) return null;

  const resetAll = () => {
    setStep("menu");
    setError("");
    setFinalResult(null);
    onClose();
  };

  const execute = (mode) => {
    try {
      setError("");
      const result = runKruskal(nodes, edges, mode);
      onApplyResult(buildKruskalGraphResult(nodes, edges, result));
      setFinalResult(result);
      setStep("result");
    } catch (err) {
      setError(err.message || "No se pudo ejecutar Kruskal.");
    }
  };

  return (
    <div onClick={resetAll} style={overlayStyle}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ ...modalStyle, maxHeight: "88vh", overflow: "auto" }}
      >
        <div style={headerStyle}>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
            {step === "menu" ? "Kruskal" : "Resultado de Kruskal"}
          </h2>
          <button onClick={resetAll} style={closeBtnStyle}>
            <X size={18} />
          </button>
        </div>

        {step === "menu" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={iconCircleStyle}>
                <Info size={40} color="#60a5fa" />
              </div>
            </div>

            <p style={subtitleStyle}>
              Kruskal trabaja con un grafo no dirigido y con pesos. Elige si quieres obtener
              el árbol de expansión mínimo o máximo.
            </p>

            <div
              style={{
                marginBottom: 18,
                padding: 14,
                borderRadius: 14,
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                color: "#1e3a8a",
                fontSize: 14,
                lineHeight: 1.45,
              }}
            >
              Nota: este algoritmo no usa aristas de un nodo hacia sí mismo. Si intentas crear
              una, el graficador te avisará para que la elimines.
            </div>

            <div style={cardsWrapStyle}>
              <button onClick={() => execute("min")} style={cardBtnStyle}>
                <Minimize2 size={22} />
                <div>
                  <div style={cardTitleStyle}>Minimizar</div>
                  <div style={cardTextStyle}>Encuentra el árbol de expansión de menor peso.</div>
                </div>
              </button>

              <button onClick={() => execute("max")} style={cardBtnStyle}>
                <Maximize2 size={22} />
                <div>
                  <div style={cardTitleStyle}>Maximizar</div>
                  <div style={cardTextStyle}>Encuentra el árbol de expansión de mayor peso.</div>
                </div>
              </button>
            </div>

            {error && <p style={errorStyle}>⚠ {error}</p>}

            <div style={footerActionsStyle}>
              <button onClick={resetAll} style={secondaryBtnStyle}>
                Cerrar
              </button>
            </div>
          </>
        )}

        {step === "result" && finalResult && (
          <>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ ...iconCircleStyle, borderColor: "#bbf7d0" }}>
                <Check size={42} color="#16a34a" />
              </div>
            </div>

            <h3 style={resultTitleStyle}>
              {finalResult.mode === "max" ? "Árbol máximo" : "Árbol mínimo"}
            </h3>
            <p style={resultSubStyle}>Peso final</p>
            <p style={distanceStyle}>{finalResult.totalWeight}</p>

            <div
              style={{
                marginTop: 18,
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  background: "#f8fafc",
                  color: "#475569",
                  fontSize: 12,
                  fontWeight: 800,
                  padding: "10px 12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                <span>Desde</span>
                <span>Hasta</span>
                <span>Peso</span>
              </div>
              {finalResult.selectedEdges.map((edge) => (
                <div
                  key={edge.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    padding: "10px 12px",
                    borderTop: "1px solid #e5e7eb",
                    fontSize: 14,
                  }}
                >
                  <strong>{getNodeName(edge.from, nodes)}</strong>
                  <strong>{getNodeName(edge.to, nodes)}</strong>
                  <span>{edge.weight}</span>
                </div>
              ))}
            </div>

            <div style={footerActionsStyle}>
              <button onClick={() => setStep("menu")} style={secondaryBtnStyle}>
                Volver
              </button>
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
