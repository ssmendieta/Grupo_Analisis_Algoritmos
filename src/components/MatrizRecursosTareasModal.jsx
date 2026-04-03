import { useMemo } from "react";
import { X } from "lucide-react";
import {
  orderedNodesByIds,
  buildAssignmentCostMatrix,
  getAssignedRtCellKeys,
} from "../utils/matrizAsignacion";

const label = (n) => n?.label ?? String(n?.id ?? "?");

export default function MatrizRecursosTareasModal({
  open,
  onClose,
  nodes,
  edges,
  assignmentResult,
}) {
  const { resources, tasks, matrix, assignedKeys, modeLabel, totalCost } = useMemo(() => {
    if (!assignmentResult?.resourceNodeIds || !assignmentResult?.taskNodeIds) {
      return {
        resources: [],
        tasks: [],
        matrix: [],
        assignedKeys: new Set(),
        modeLabel: "",
        totalCost: null,
      };
    }
    const resources = orderedNodesByIds(assignmentResult.resourceNodeIds, nodes);
    const tasks = orderedNodesByIds(assignmentResult.taskNodeIds, nodes);
    const matrix = buildAssignmentCostMatrix(resources, tasks, edges);
    const assignedKeys = getAssignedRtCellKeys(
      resources,
      tasks,
      edges,
      assignmentResult.assignedEdgeIds
    );
    const modeLabel =
      assignmentResult.mode === "assignment-min" ? "Minimización (costo mínimo)" : "Maximización (beneficio máximo)";
    return {
      resources,
      tasks,
      matrix,
      assignedKeys,
      modeLabel,
      totalCost: assignmentResult.totalCost,
    };
  }, [nodes, edges, assignmentResult]);

  if (!open || !assignmentResult) return null;

  const accent =
    assignmentResult.mode === "assignment-min"
      ? { border: "#3b82f6", head: "#60a5fa", cell: "#1e3a5f" }
      : { border: "#7c3aed", head: "#a78bfa", cell: "#3b0764" };

  return (
    <div onClick={onClose} style={overlayStyle}>
      <div onClick={(e) => e.stopPropagation()} style={modalStyle}>
        <div style={headerStyle}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#fff" }}>
              Matriz de costos
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>
              Filas = recursos · Columnas = tareas
            </p>
          </div>
          <button type="button" onClick={onClose} style={closeBtnStyle} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div style={{ ...summaryRow, borderColor: `${accent.border}40` }}>
          <span style={{ fontSize: 13, color: "#94a3b8" }}>{modeLabel}</span>
          <span style={{ fontSize: 22, fontWeight: 900, color: accent.head, fontFamily: "monospace" }}>
            {totalCost}
          </span>
        </div>

        {resources.length === 0 || tasks.length === 0 ? (
          <p style={{ color: "#94a3b8", fontSize: 13 }}>No hay datos de recursos o tareas para esta solución.</p>
        ) : (
          <div style={tableScroll}>
            <table style={{ borderCollapse: "separate", borderSpacing: 4, width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ ...thCorner, color: accent.head }}>Recurso \ Tarea</th>
                  {tasks.map((t) => (
                    <th key={t.id} style={{ ...th, color: accent.head, borderBottom: `2px solid ${accent.border}60` }}>
                      {label(t)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resources.map((row, i) => (
                  <tr key={row.id}>
                    <th
                      style={{
                        ...thRow,
                        color: accent.head,
                        borderRight: `2px solid ${accent.border}60`,
                        textAlign: "right",
                      }}
                    >
                      {label(row)}
                    </th>
                    {tasks.map((col, j) => {
                      const val = matrix[i]?.[j];
                      const isSel = assignedKeys.has(`${i},${j}`);
                      return (
                        <td
                          key={col.id}
                          style={{
                            ...td,
                            background: isSel
                              ? "linear-gradient(145deg, #047857, #065f46)"
                              : val !== null
                                ? accent.cell
                                : "#0f172a",
                            color: isSel ? "#ecfdf5" : val !== null ? "#e2e8f0" : "#475569",
                            fontWeight: isSel ? 900 : val !== null ? 700 : 500,
                            boxShadow: isSel ? "0 0 0 2px #34d399, 0 4px 14px rgba(16,185,129,0.35)" : "none",
                          }}
                        >
                          {val !== null ? val : "∅"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p style={{ margin: "14px 0 0", fontSize: 11, color: "#64748b", lineHeight: 1.5 }}>
          Las celdas <strong style={{ color: "#34d399" }}>verdes</strong> son las del emparejamiento óptimo actual.
          ∅ indica que no hay arista (costo no definido entre ese par).
        </p>

        <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
          <button type="button" onClick={onClose} style={primaryBtn}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.78)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10050,
  padding: 16,
  backdropFilter: "blur(6px)",
};
const modalStyle = {
  width: "min(920px, 100%)",
  maxHeight: "min(88vh, 900px)",
  overflow: "auto",
  background: "#0d1117",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 18,
  padding: 22,
  color: "#e2e8f0",
  boxShadow: "0 32px 80px rgba(0,0,0,0.85)",
};
const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 14,
  paddingBottom: 14,
  borderBottom: "1px solid rgba(255,255,255,0.06)",
};
const closeBtnStyle = {
  background: "transparent",
  border: "none",
  color: "#64748b",
  cursor: "pointer",
  padding: 4,
};
const summaryRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 16,
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid",
  background: "rgba(255,255,255,0.03)",
};
const tableScroll = {
  overflowX: "auto",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.06)",
  padding: 10,
  background: "#070a10",
};
const thCorner = {
  padding: "8px 10px",
  fontSize: 10,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  textAlign: "left",
  verticalAlign: "bottom",
};
const th = {
  padding: "8px 10px",
  fontSize: 12,
  fontWeight: 800,
  textAlign: "center",
  minWidth: 56,
};
const thRow = {
  padding: "8px 12px",
  fontSize: 12,
  fontWeight: 800,
  whiteSpace: "nowrap",
};
const td = {
  padding: "10px 12px",
  textAlign: "center",
  fontSize: 14,
  fontFamily: "ui-monospace, monospace",
  borderRadius: 8,
  minWidth: 52,
};
const primaryBtn = {
  padding: "9px 22px",
  borderRadius: 9,
  background: "linear-gradient(135deg, #1d4ed8, #7c3aed)",
  color: "#fff",
  border: "none",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 13,
};
