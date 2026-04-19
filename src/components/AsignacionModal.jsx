import { useState, useEffect } from "react";
import {
  X,
  Minimize2,
  Maximize2,
  Check,
  AlertTriangle,
  Copy,
} from "lucide-react";
import { asignacion } from "../utils/asignacion";

export default function AssignmentModal({
  open,
  onClose,
  resourceNodes,
  taskNodes,
  edges,
  onApplyResult,
  initialResult,
}) {
  const [step, setStep] = useState("menu");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [mode, setMode] = useState(null);

  const [altIdx, setAltIdx] = useState(0);

  useEffect(() => {
    if (!open) return;
    if (initialResult) {
      // Reconstruir el estado de resultado desde el resultado guardado
      const m = initialResult.mode?.replace("assignment-", "") ?? "min";
      setMode(m);
      setStep("result");
      setAltIdx(0);
      setResult({
        hun: null,
        buildRows: () => [],
        buildHighlight: () => ({ edgeIds: new Set(), nodeIds: new Set() }),
        totalCost: initialResult.totalCost,
        paddedRows: 0,
        paddedCols: 0,
        alternativeSolutions: initialResult.alternativeSolutions ?? [],
        hasMultipleSolutions: initialResult.hasMultipleSolutions ?? false,
        rows: (() => {
          const rows = [];
          for (const edgeId of initialResult.assignedEdgeIds) {
            const edge = edges.find((e) => e.id === edgeId);
            if (!edge) continue;
            const resNode = resourceNodes.find(
              (n) => n.id === edge.from || n.id === edge.to,
            );
            const taskNode = taskNodes.find(
              (n) => n.id === edge.to || n.id === edge.from,
            );
            if (resNode && taskNode) {
              rows.push({
                resourceName: resNode.label || String(resNode.id),
                taskName: taskNode.label || String(taskNode.id),
                cost: edge.weight ?? 1,
                isFictResource: false,
                isFictTask: false,
              });
            }
          }
          return rows;
        })(),
        assignedEdgeIds: initialResult.assignedEdgeIds,
        assignedNodeIds: initialResult.assignedNodeIds,
      });
    } else {
      setStep("menu");
      setError("");
      setResult(null);
      setMode(null);
      setAltIdx(0);
    }
  }, [open]);

  if (!open) return null;

  const resetAll = () => {
    setStep("menu");
    setError("");
    setResult(null);
    setMode(null);
    setAltIdx(0);
    onClose();
  };

  const buildCostMatrix = () => {
    const r = resourceNodes.length;
    const t = taskNodes.length;
    if (r === 0 || t === 0)
      throw new Error("Necesitas al menos un recurso y una tarea.");

    const matrix = Array.from({ length: r }, () => new Array(t).fill(0));
    for (const edge of edges) {
      const ri = resourceNodes.findIndex(
        (n) => n.id === edge.from || n.id === edge.to,
      );
      const ti = taskNodes.findIndex(
        (n) => n.id === edge.to || n.id === edge.from,
      );
      if (ri !== -1 && ti !== -1) {
        const fwd =
          resourceNodes[ri].id === edge.from && taskNodes[ti].id === edge.to;
        const bwd =
          resourceNodes[ri].id === edge.to && taskNodes[ti].id === edge.from;
        if (fwd || bwd) matrix[ri][ti] = edge.weight ?? 1;
      }
    }
    return matrix;
  };

  const runAssignment = (selectedMode) => {
    try {
      setError("");
      const costMatrix = buildCostMatrix();
      const hun = asignacion(costMatrix, selectedMode);
      const {
        assignment,
        totalCost,
        n,
        paddedRows,
        paddedCols,
        originalRows,
        originalCols,
        alternativeSolutions,
        hasMultipleSolutions,
      } = hun;

      const buildRows = (sol) => {
        const rows = [];
        for (let i = 0; i < n; i++) {
          const j = sol[i];
          if (j === -1) continue;
          const isFictR = i >= originalRows;
          const isFictT = j >= originalCols;
          rows.push({
            resourceName: isFictR
              ? `Recurso ficticio ${i - originalRows + 1}`
              : label(resourceNodes[i]),
            taskName: isFictT
              ? `Tarea ficticia ${j - originalCols + 1}`
              : label(taskNodes[j]),
            cost: hun.matrix[i][j],
            isFictResource: isFictR,
            isFictTask: isFictT,
          });
        }
        return rows;
      };

      const buildHighlight = (sol) => {
        const edgeIds = new Set();
        const nodeIds = new Set();
        for (let i = 0; i < originalRows; i++) {
          const j = sol[i];
          if (j === -1 || j >= originalCols) continue;
          const resId = resourceNodes[i].id;
          const taskId = taskNodes[j].id;
          nodeIds.add(resId);
          nodeIds.add(taskId);
          for (const e of edges) {
            if (
              (e.from === resId && e.to === taskId) ||
              (e.from === taskId && e.to === resId)
            )
              edgeIds.add(e.id);
          }
        }
        return { edgeIds, nodeIds };
      };

      const { edgeIds, nodeIds } = buildHighlight(assignment);

      setMode(selectedMode);
      setAltIdx(0);
      setResult({
        hun,
        buildRows,
        buildHighlight,
        totalCost,
        paddedRows,
        paddedCols,
        alternativeSolutions,
        hasMultipleSolutions,
        rows: buildRows(assignment),
        assignedEdgeIds: edgeIds,
        assignedNodeIds: nodeIds,
      });
      setStep("result");

      onApplyResult({
        mode: `assignment-${selectedMode}`,
        assignedEdgeIds: edgeIds,
        assignedNodeIds: nodeIds,
        totalCost,
        alternativeSolutions,
        hasMultipleSolutions,
        resourceNodeIds: resourceNodes.map((n) => n.id),
        taskNodeIds: taskNodes.map((n) => n.id),
      });
    } catch (err) {
      setError(err.message || "Error al ejecutar el algoritmo húngaro.");
    }
  };

  const showAlt = (idx) => {
    if (!result) return;
    const sol = result.alternativeSolutions[idx];
    const rows = result.buildRows(sol);
    const { edgeIds, nodeIds } = result.buildHighlight(sol);
    setAltIdx(idx);
    setResult((prev) => ({
      ...prev,
      rows,
      assignedEdgeIds: edgeIds,
      assignedNodeIds: nodeIds,
    }));
    onApplyResult({
      mode: `assignment-${mode}`,
      assignedEdgeIds: edgeIds,
      assignedNodeIds: nodeIds,
      totalCost: result.totalCost,
      alternativeSolutions: result.alternativeSolutions,
      hasMultipleSolutions: result.hasMultipleSolutions,
      resourceNodeIds: resourceNodes.map((n) => n.id),
      taskNodeIds: taskNodes.map((n) => n.id),
    });
  };

  const accentColor = mode === "min" ? "#3b82f6" : "#7c3aed";
  const accentLight = mode === "min" ? "#60a5fa" : "#a78bfa";

  return (
    <div onClick={resetAll} style={overlayStyle}>
      <div onClick={(e) => e.stopPropagation()} style={modalStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                ...headerIconStyle,
                background: `linear-gradient(135deg, #1d4ed8, #7c3aed)`,
              }}
            >
              <GridIcon />
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#fff",
                }}
              >
                Problema de Asignación
              </h2>
              <p style={{ margin: 0, fontSize: 11, color: "#475569" }}>
                Algoritmo Húngaro
              </p>
            </div>
          </div>
          <button onClick={resetAll} style={closeBtnStyle}>
            <X size={18} />
          </button>
        </div>

        {/* Chips de resumen */}
        <div style={summaryBar}>
          <Chip label="Recursos" value={resourceNodes.length} color="#3b82f6" />
          <span style={{ color: "#334155", fontSize: 18 }}>→</span>
          <Chip label="Tareas" value={taskNodes.length} color="#7c3aed" />
          {resourceNodes.length !== taskNodes.length && (
            <div style={warningChip}>
              <AlertTriangle size={13} color="#f59e0b" />
              <span style={{ fontSize: 11, color: "#f59e0b" }}>
                +{Math.abs(resourceNodes.length - taskNodes.length)}{" "}
                {resourceNodes.length < taskNodes.length
                  ? "recurso(s)"
                  : "tarea(s)"}{" "}
                ficticio(s)
              </span>
            </div>
          )}
        </div>

        {step === "menu" && (
          <>
            <p style={subtitleStyle}>
              Elige el tipo de asignación que quieres resolver.
            </p>
            <div style={cardsGrid}>
              <CardBtn
                onClick={() => runAssignment("min")}
                bg="#0f2044"
                border="#3b82f6"
                icon={<Minimize2 size={22} color="#60a5fa" />}
                title="Minimizar"
                desc="Costo mínimo total. Ideal para costos, distancias o tiempos."
              />
              <CardBtn
                onClick={() => runAssignment("max")}
                bg="#1a0f44"
                border="#7c3aed"
                icon={<Maximize2 size={22} color="#a78bfa" />}
                title="Maximizar"
                desc="Beneficio máximo total. Ideal para ganancias o rendimiento."
              />
            </div>
            {error && <div style={errorBox}>{error}</div>}
            <div style={footer}>
              <button onClick={resetAll} style={secondaryBtn}>
                Cerrar
              </button>
            </div>
          </>
        )}

        {/* ── RESULTADO ── */}
        {step === "result" && result && (
          <>
            {/* Costo total */}
            <div style={resultHeader}>
              <div style={{ ...resultIconCircle, background: accentColor }}>
                <Check size={20} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>
                  {mode === "min"
                    ? "Asignación de Costo Mínimo"
                    : "Asignación de Beneficio Máximo"}
                </div>
                <div style={{ fontSize: 11, color: "#475569" }}>
                  Costo total óptimo
                </div>
              </div>
              <div
                style={{
                  marginLeft: "auto",
                  fontSize: 30,
                  fontWeight: 900,
                  color: accentLight,
                  fontFamily: "monospace",
                }}
              >
                {result.totalCost}
              </div>
            </div>

            {/* Banner de soluciones múltiples */}
            {result.hasMultipleSolutions && (
              <div style={multiSolBanner}>
                <div style={multiSolHeader}>
                  <Copy size={14} color="#f59e0b" />
                  <span
                    style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b" }}
                  >
                    ¡Existen {result.alternativeSolutions.length} soluciones
                    óptimas alternativas!
                  </span>
                </div>
                <p
                  style={{
                    margin: "6px 0 10px",
                    fontSize: 11,
                    color: "#94a3b8",
                    lineHeight: 1.5,
                  }}
                >
                  Todas tienen el mismo costo óptimo de{" "}
                  <strong style={{ color: accentLight }}>
                    {result.totalCost}
                  </strong>
                  . Selecciona una para visualizarla en el grafo y la tabla.
                </p>
                <div style={altButtonsRow}>
                  {result.alternativeSolutions.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => showAlt(idx)}
                      style={{
                        ...altBtn,
                        background:
                          altIdx === idx
                            ? accentColor
                            : "rgba(255,255,255,0.05)",
                        border:
                          altIdx === idx
                            ? `1px solid ${accentLight}`
                            : "1px solid rgba(255,255,255,0.08)",
                        color: altIdx === idx ? "#fff" : "#64748b",
                        fontWeight: altIdx === idx ? 800 : 600,
                      }}
                    >
                      S{idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Ficticios */}
            {(result.paddedRows > 0 || result.paddedCols > 0) && (
              <div style={warningBox}>
                <AlertTriangle size={13} color="#f59e0b" />
                <span style={{ fontSize: 11, color: "#f59e0b" }}>
                  Se agregaron{" "}
                  {result.paddedRows > 0
                    ? `${result.paddedRows} recurso(s) ficticio(s)`
                    : ""}
                  {result.paddedRows > 0 && result.paddedCols > 0 ? " y " : ""}
                  {result.paddedCols > 0
                    ? `${result.paddedCols} tarea(s) ficticia(s)`
                    : ""}{" "}
                  (costo = 0).
                </span>
              </div>
            )}

            {/* Tabla de asignación */}
            <div style={tableWrap}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["#", "Recurso", "Tarea", "Costo"].map((h) => (
                      <th key={h} style={th}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row, i) => (
                    <tr
                      key={i}
                      style={{
                        background:
                          row.isFictResource || row.isFictTask
                            ? "rgba(245,158,11,0.04)"
                            : i % 2 === 0
                              ? "transparent"
                              : "rgba(255,255,255,0.02)",
                      }}
                    >
                      <td style={td}>{i + 1}</td>
                      <td
                        style={{
                          ...td,
                          color: row.isFictResource ? "#f59e0b" : "#60a5fa",
                          fontWeight: 700,
                        }}
                      >
                        {row.resourceName}
                        {row.isFictResource && <Badge>ficticio</Badge>}
                      </td>
                      <td
                        style={{
                          ...td,
                          color: row.isFictTask ? "#f59e0b" : "#a78bfa",
                          fontWeight: 700,
                        }}
                      >
                        {row.taskName}
                        {row.isFictTask && <Badge>ficticio</Badge>}
                      </td>
                      <td
                        style={{
                          ...td,
                          textAlign: "right",
                          fontWeight: 800,
                          color: "#e2e8f0",
                          fontFamily: "monospace",
                        }}
                      >
                        {row.cost}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td
                      colSpan={3}
                      style={{
                        ...td,
                        textAlign: "right",
                        color: "#475569",
                        fontSize: 11,
                      }}
                    >
                      Total
                    </td>
                    <td
                      style={{
                        ...td,
                        textAlign: "right",
                        fontWeight: 900,
                        fontSize: 16,
                        color: accentLight,
                        fontFamily: "monospace",
                      }}
                    >
                      {result.totalCost}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div style={footer}>
              <button
                onClick={() => {
                  setStep("menu");
                  setError("");
                  setResult(null);
                  setAltIdx(0);
                }}
                style={secondaryBtn}
              >
                ← Volver
              </button>
              <button
                onClick={resetAll}
                style={{ ...primaryBtn, background: accentColor }}
              >
                OK, aplicar al grafo
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

const label = (n) => n?.label || String(n?.id ?? "?");

function GridIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="2.5"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function Chip({ label, value, color }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        padding: "8px 16px",
        borderRadius: 10,
        background: `${color}18`,
        border: `1px solid ${color}30`,
        minWidth: 72,
      }}
    >
      <span style={{ fontWeight: 900, fontSize: 20, color }}>{value}</span>
      <span style={{ fontSize: 11, color: "#64748b" }}>{label}</span>
    </div>
  );
}

function CardBtn({ onClick, bg, border, icon, title, desc }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: bg,
        border: `1px solid ${border}40`,
        borderRadius: 14,
        padding: "18px 16px",
        textAlign: "left",
        display: "flex",
        gap: 14,
        cursor: "pointer",
        alignItems: "flex-start",
        transition: "border-color 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = border)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = `${border}40`)}
    >
      {icon}
      <div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: "#fff",
            marginBottom: 6,
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
          {desc}
        </div>
      </div>
    </button>
  );
}

function Badge({ children }) {
  return (
    <span
      style={{
        marginLeft: 6,
        padding: "1px 6px",
        borderRadius: 4,
        background: "rgba(245,158,11,0.15)",
        color: "#f59e0b",
        fontSize: 10,
        fontWeight: 700,
        verticalAlign: "middle",
      }}
    >
      {children}
    </span>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.75)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
  backdropFilter: "blur(6px)",
};
const modalStyle = {
  width: "min(660px, 94vw)",
  background: "#0d1117",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 20,
  padding: 24,
  color: "#e2e8f0",
  boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
  maxHeight: "90vh",
  overflowY: "auto",
};
const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 18,
  paddingBottom: 16,
  borderBottom: "1px solid rgba(255,255,255,0.06)",
};
const headerIconStyle = {
  width: 36,
  height: 36,
  borderRadius: 9,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};
const closeBtnStyle = {
  background: "transparent",
  border: "none",
  color: "#475569",
  cursor: "pointer",
  padding: 4,
};
const summaryBar = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 18,
  flexWrap: "wrap",
};
const warningChip = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 12px",
  borderRadius: 8,
  background: "rgba(245,158,11,0.08)",
  border: "1px solid rgba(245,158,11,0.25)",
};
const subtitleStyle = {
  color: "#475569",
  fontSize: 13,
  marginBottom: 16,
  lineHeight: 1.5,
};
const cardsGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
  marginBottom: 4,
};
const errorBox = {
  marginTop: 12,
  padding: "10px 14px",
  background: "rgba(239,68,68,0.1)",
  border: "1px solid rgba(239,68,68,0.3)",
  borderRadius: 8,
  color: "#f87171",
  fontSize: 12,
};
const footer = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  marginTop: 16,
};
const secondaryBtn = {
  padding: "9px 18px",
  borderRadius: 9,
  background: "rgba(255,255,255,0.05)",
  color: "#94a3b8",
  border: "1px solid rgba(255,255,255,0.08)",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 13,
};
const primaryBtn = {
  padding: "9px 20px",
  borderRadius: 9,
  color: "white",
  border: "none",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 13,
};
const resultHeader = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "12px 16px",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 12,
  marginBottom: 12,
};
const resultIconCircle = {
  width: 38,
  height: 38,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};
const multiSolBanner = {
  padding: "12px 16px",
  background: "rgba(245,158,11,0.06)",
  border: "1px solid rgba(245,158,11,0.2)",
  borderRadius: 12,
  marginBottom: 12,
};
const multiSolHeader = { display: "flex", alignItems: "center", gap: 8 };
const altButtonsRow = { display: "flex", gap: 6, flexWrap: "wrap" };
const altBtn = {
  padding: "5px 12px",
  borderRadius: 7,
  fontSize: 12,
  cursor: "pointer",
  transition: "all 0.15s",
};
const warningBox = {
  display: "flex",
  alignItems: "flex-start",
  gap: 8,
  padding: "9px 14px",
  background: "rgba(245,158,11,0.07)",
  border: "1px solid rgba(245,158,11,0.2)",
  borderRadius: 8,
  marginBottom: 12,
};
const tableWrap = {
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 10,
  overflow: "hidden",
  marginBottom: 4,
};
const th = {
  padding: "9px 14px",
  textAlign: "left",
  fontSize: 10,
  fontWeight: 700,
  color: "#475569",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  background: "rgba(255,255,255,0.03)",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
};
const td = {
  padding: "9px 14px",
  fontSize: 13,
  color: "#e2e8f0",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
};
