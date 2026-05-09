import { useMemo } from "react";
import { useLocation } from "react-router-dom";

import { matrixPageStyles as styles } from "../styles/js/adjacencyMatrixStyles.js";
function useAdjacencyMatrix(nodeList, edgeList) {
  return useMemo(() => {
    const matrix = {};
    nodeList.forEach((r) => {
      matrix[r.id] = {};
      nodeList.forEach((c) => (matrix[r.id][c.id] = null));
    });

    edgeList.forEach(({ from, to, weight, isLoop }) => {
      if (matrix[from] && matrix[from][to] !== undefined) {
        matrix[from][to] = weight !== null ? weight : 1;
        if (isLoop) matrix[from][to] = weight !== null ? weight : "∞";
      }
    });

    return matrix;
  }, [nodeList, edgeList]);
}

function getCellStyle(value, isLoop, isDiagonal, isAssignment) {
  if (isAssignment && value !== null)
    return { bg: "#047857", text: "#ecfdf5", shadow: "0 0 14px #10b98166" };
  if (isAssignment)
    return {
      bg: "#022c22",
      text: "#6ee7b7",
      shadow: "inset 0 0 0 2px #10b981",
    };
  if (isLoop && value !== null)
    return { bg: "#6366f1", text: "#fff", shadow: "0 0 12px #6366f180" };
  if (value !== null)
    return { bg: "#22d3ee", text: "#0f172a", shadow: "0 0 10px #22d3ee60" };
  if (isDiagonal) return { bg: "#1e293b", text: "#475569", shadow: "none" };
  return { bg: "#0f172a", text: "#334155", shadow: "none" };
}

function useAssignmentPairKeys(assignmentResult) {
  return useMemo(() => {
    const s = new Set();
    if (!assignmentResult?.assignedPairs?.length) return s;
    for (const p of assignmentResult.assignedPairs) {
      s.add(`${p.from}|${p.to}`);
      s.add(`${p.to}|${p.from}`);
    }
    return s;
  }, [assignmentResult]);
}

export default function AdjacencyMatrix() {
  const location = useLocation();
  const { nodes, edges, assignmentResult } = location.state ?? {
    nodes: [],
    edges: [],
  };
  const matrix = useAdjacencyMatrix(nodes, edges);
  const assignmentPairKeys = useAssignmentPairKeys(assignmentResult);

  const isAssignedEdge = (e) =>
    assignmentResult?.assignedPairs?.some(
      (p) =>
        (p.from === e.from && p.to === e.to) ||
        (p.from === e.to && p.to === e.from),
    ) ?? false;

  const edgeCount = edges.filter((e) => !e.isLoop).length;
  const rowSums = {};
  nodes.forEach((row) => {
    rowSums[row.id] = nodes.reduce(
      (acc, col) => acc + (matrix[row.id][col.id] ?? 0),
      0,
    );
  });

  const colSums = {};
  nodes.forEach((col) => {
    colSums[col.id] = nodes.reduce(
      (acc, row) => acc + (matrix[row.id][col.id] ?? 0),
      0,
    );
  });

  const rowCont = {};

  nodes.forEach((row) => {
    rowCont[row.id] = nodes.reduce((acc, col) => {
      return acc + (matrix[row.id][col.id] != null ? 1 : 0);
    }, 0);
  });

  const colCont = {};

  nodes.forEach((col) => {
    colCont[col.id] = nodes.reduce((acc, row) => {
      return acc + (matrix[row.id][col.id] !== null ? 1 : 0);
    }, 0);
  });

  const nAlt = assignmentResult?.alternativeSolutions?.length ?? 0;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Matriz de Adyacencia</h1>
        <div style={styles.stats}>
          <Stat label="Nodos" value={nodes.length} color="#22d3ee" />
          <Stat label="Aristas" value={edgeCount} color="#a78bfa" />
        </div>
      </div>

      {assignmentResult && (
        <div style={styles.assignmentBanner}>
          <div style={styles.assignmentTitle}>
            Solución de asignación (actual en el grafo)
          </div>
          <p style={styles.assignmentText}>
            <strong
              style={{
                color:
                  assignmentResult.mode === "assignment-min"
                    ? "#60a5fa"
                    : "#a78bfa",
              }}
            >
              {assignmentResult.mode === "assignment-min"
                ? "Minimización"
                : "Maximización"}
            </strong>
            {" · "}
            Valor óptimo:{" "}
            <span
              style={{
                fontFamily: "monospace",
                fontWeight: 800,
                color: "#34d399",
              }}
            >
              {assignmentResult.totalCost}
            </span>
          </p>
          {assignmentResult.hasMultipleSolutions && nAlt > 1 && (
            <p style={styles.assignmentMulti}>
              Existen <strong>{nAlt}</strong> soluciones óptimas distintas con
              el mismo valor. En el grafo y aquí se muestra una de ellas (celdas
              y aristas resaltadas en verde).
            </p>
          )}
          <p style={styles.assignmentHint}>
            Leyenda: celdas{" "}
            <span style={{ color: "#34d399", fontWeight: 700 }}>verdes</span> =
            pares recurso–tarea de la asignación elegida.
          </p>
        </div>
      )}

      <div style={styles.matrixWrapper}>
        <div style={styles.matrixScroll}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.cornerCell}>↓ from / to →</th>
                {nodes.map((col) => (
                  <th key={col.id} style={styles.headerCell}>
                    {col.label == null ? col.id : col.label}
                  </th>
                ))}
                <th>∑</th>
                <th>Cont Filas</th>
              </tr>
            </thead>
            <tbody>
              {nodes.map((row) => (
                <tr key={row.id}>
                  <td style={styles.rowHeaderCell}>
                    {row.label == null ? row.id : row.label}
                  </td>
                  {nodes.map((col) => {
                    const val = matrix[row.id][col.id];
                    const isDiag = row.id === col.id;
                    const isLoop = isDiag && val !== null;
                    const isAssignment = assignmentPairKeys.has(
                      `${row.id}|${col.id}`,
                    );
                    const { bg, text, shadow } = getCellStyle(
                      val,
                      isLoop,
                      isDiag,
                      isAssignment,
                    );
                    return (
                      <td
                        key={col.id}
                        title={`${row.id} → ${col.id}: ${val ?? "sin conexión"}${isAssignment ? " · asignación" : ""}`}
                        style={{
                          ...styles.cell,
                          background: bg,
                          color: text,
                          boxShadow: shadow,
                        }}
                      >
                        {val !== null ? (
                          val
                        ) : (
                          <span style={styles.null}>∅</span>
                        )}
                      </td>
                    );
                  })}
                  <td
                    style={{
                      ...styles.cell,
                      background: "#1e293b",
                      color: "#f472b6",
                      fontWeight: 700,
                    }}
                  >
                    {rowSums[row.id]}
                  </td>
                  <td
                    style={{
                      ...styles.cell,
                      background: "#1e293b",
                      color: "#f472b6",
                      fontWeight: 700,
                    }}
                  >
                    {rowCont[row.id]}
                  </td>
                </tr>
              ))}
              <tr>
                <td style={styles.rowHeaderCell}>∑</td>
                {nodes.map((col) => (
                  <td
                    key={col.id}
                    style={{
                      ...styles.cell,
                      background: "#1e293b",
                      color: "#f472b6",
                      fontWeight: 700,
                    }}
                  >
                    {colSums[col.id]}
                  </td>
                ))}
                <td
                  style={{
                    ...styles.cell,
                    background: "#1e293b",
                    color: "#f472b6",
                    fontWeight: 700,
                  }}
                />
                <td
                  style={{
                    ...styles.cell,
                    background: "#1e293b",
                    color: "#f472b6",
                    fontWeight: 700,
                  }}
                />
              </tr>
              <tr>
                <td style={styles.rowHeaderCell}>Cont Colum</td>
                {nodes.map((col) => (
                  <td
                    key={`count-${col.id}`}
                    style={{
                      ...styles.cell,
                      background: "#1e293b",
                      color: "#22d3ee",
                      fontWeight: 700,
                    }}
                  >
                    {colCont[col.id]}
                  </td>
                ))}
                <td
                  style={{
                    ...styles.cell,
                    background: "#1e293b",
                    color: "#22d3ee",
                    fontWeight: 700,
                  }}
                />
                <td
                  style={{
                    ...styles.cell,
                    background: "#1e293b",
                    color: "#22d3ee",
                    fontWeight: 700,
                  }}
                />
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div style={styles.edgeList}>
        <h2 style={styles.sectionTitle}>Aristas registradas</h2>
        <div style={styles.edgeGrid}>
          {edges.map((e) => (
            <div
              key={e.id}
              style={{
                ...styles.edgeCard,
                ...(isAssignedEdge(e) ? styles.edgeCardAssigned : {}),
              }}
            >
              <span style={styles.edgeRoute}>
                {e.from}
                <span style={styles.arrow}>{e.isLoop ? " ↩" : " →"}</span>
                {e.to}
              </span>
              {e.weight !== null && (
                <span style={styles.edgeWeight}>w: {e.weight}</span>
              )}
              {e.isLoop && <span style={styles.loopBadge}>loop</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={styles.stat}>
      <span style={{ ...styles.statValue, color }}>{value}</span>
      <span style={styles.statLabel}>{label}</span>
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div style={styles.legendItem}>
      <div style={{ ...styles.legendDot, background: color }} />
      <span style={styles.legendText}>{label}</span>
    </div>
  );
}
