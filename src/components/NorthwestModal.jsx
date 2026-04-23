import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Download,
  Grid3X3,
  Lightbulb,
  Play,
  Plus,
  RefreshCcw,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  balanceTransportation,
  getSolutionSeries,
  solveTransportationProblem,
} from "../utils/northwest";
import {
  buildNorthwestExportPayload,
  buildTransportationInputFromEditor,
} from "../utils/transporteMatriz";

function createMatrix(rows, cols, fill = 0) {
  return Array.from({ length: rows }, () => Array(cols).fill(fill));
}

function numberValue(value, fallback = 0) {
  if (value === "" || value === null || value === undefined) return fallback;
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function formatNumber(value) {
  const num = Number(value || 0);
  return Number.isInteger(num) ? String(num) : num.toFixed(2);
}

function displayEditorValue(value) {
  if (value === "" || value === null || value === undefined) return "";
  const normalized = Number(value);
  return Number.isFinite(normalized) ? String(normalized) : "";
}

function createLabels(prefix, count) {
  return Array.from({ length: count }, (_, index) => `${prefix}${index + 1}`);
}

function getDefaultCase() {
  return {
    rowLabels: ["Origen 1", "Origen 2", "Origen 3"],
    colLabels: ["Destino 1", "Destino 2", "Destino 3", "Destino 4"],
    supply: [60, 30, 20],
    demand: [50, 10, 40, 10],
    costs: [
      [34, 40, 7, 80],
      [35, 54, 50, 12],
      [78, 76, 6, 34],
    ],
  };
}

function getExamples() {
  return [
    {
      id: "base",
      name: "Ejemplo base",
      description: "Caso pequeño y balanceado para probar la interfaz.",
      data: getDefaultCase(),
    },
    {
      id: "clases",
      name: "Ejemplo 4×4",
      description: "Ideal para revisar varias iteraciones y el resumen final.",
      data: {
        rowLabels: ["Planta A", "Planta B", "Planta C", "Planta D"],
        colLabels: ["La Paz", "Cochabamba", "Santa Cruz", "Sucre"],
        supply: [40, 25, 35, 20],
        demand: [30, 20, 40, 30],
        costs: [
          [8, 6, 10, 9],
          [9, 12, 13, 7],
          [14, 9, 16, 5],
          [6, 8, 11, 10],
        ],
      },
    },
    {
      id: "max",
      name: "Ejemplo ganancia",
      description: "Pensado para usar el modo maximizar.",
      data: {
        rowLabels: ["Centro 1", "Centro 2", "Centro 3"],
        colLabels: ["Cliente A", "Cliente B", "Cliente C", "Cliente D"],
        supply: [50, 40, 30],
        demand: [20, 35, 25, 40],
        costs: [
          [70, 60, 55, 80],
          [75, 68, 72, 66],
          [62, 85, 60, 74],
        ],
      },
    },
  ];
}

function cloneManualData(data) {
  return {
    rowLabels: [...data.rowLabels],
    colLabels: [...data.colLabels],
    supply: [...data.supply],
    demand: [...data.demand],
    costs: data.costs.map((row) => [...row]),
  };
}

function parseImportedNorthwest(data) {
  const rows = Array.isArray(data?.costs) ? data.costs.length : 0;
  const cols =
    rows > 0 && Array.isArray(data.costs[0]) ? data.costs[0].length : 0;

  return {
    rowLabels: Array.isArray(data?.rowLabels)
      ? data.rowLabels.map((value, index) =>
          String(value || `Origen ${index + 1}`),
        )
      : createLabels("Origen ", rows),
    colLabels: Array.isArray(data?.colLabels)
      ? data.colLabels.map((value, index) =>
          String(value || `Destino ${index + 1}`),
        )
      : createLabels("Destino ", cols),
    supply: Array.isArray(data?.supply)
      ? data.supply.map((value) => numberValue(value))
      : Array(rows).fill(0),
    demand: Array.isArray(data?.demand)
      ? data.demand.map((value) => numberValue(value))
      : Array(cols).fill(0),
    costs: Array.isArray(data?.costs)
      ? data.costs.map((row) => row.map((value) => numberValue(value)))
      : createMatrix(rows || 3, cols || 3, 0),
  };
}

function downloadTextFile(filename, contents, type) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function cellHeatStyle(cost, allocation) {
  const hasAllocation = Number(allocation || 0) > 0;
  if (!hasAllocation) {
    return {
      background: "rgba(8, 15, 35, 0.92)",
      boxShadow: "inset 0 0 0 1px rgba(148,163,184,0.12)",
    };
  }

  const intensity = Math.min(1, 0.25 + Number(allocation || 0) / 80);
  return {
    background: `linear-gradient(135deg, rgba(96,165,250,${0.34 + intensity * 0.2}), rgba(34,197,94,${0.08 + intensity * 0.08}))`,
    boxShadow: "inset 0 0 0 1px rgba(96,165,250,0.22)",
  };
}

function buildIterationMessage(step, rowLabels, colLabels, costs, mode) {
  if (!step?.allocation) return null;

  if (step.enteringCell && Number.isFinite(step.theta) && step.theta > 0) {
    const rowLabel =
      rowLabels[step.enteringCell.row] || `Origen ${step.enteringCell.row + 1}`;
    const colLabel =
      colLabels[step.enteringCell.col] ||
      `Destino ${step.enteringCell.col + 1}`;
    const unit = numberValue(
      costs?.[step.enteringCell.row]?.[step.enteringCell.col],
    );
    return {
      title: `Se genera una nueva solución moviendo θ = ${formatNumber(step.theta)} en ${rowLabel} → ${colLabel}.`,
      chips: [
        `${mode === "max" ? "Beneficio" : "Costo"} unitario: ${formatNumber(unit)}`,
        `θ: ${formatNumber(step.theta)}`,
        step.leavingCell
          ? `Sale de base: ${rowLabels[step.leavingCell.row] || `Origen ${step.leavingCell.row + 1}`} → ${colLabels[step.leavingCell.col] || `Destino ${step.leavingCell.col + 1}`}`
          : "Base actualizada",
      ],
    };
  }

  const allocs = [];
  for (let i = 0; i < step.allocation.length; i += 1) {
    for (let j = 0; j < step.allocation[0].length; j += 1) {
      const value = numberValue(step.allocation[i][j]);
      if (value > 0) {
        allocs.push({ row: i, col: j, value });
      }
    }
  }

  if (!allocs.length) {
    return {
      title: "No hay asignaciones registradas en esta solución.",
      chips: [],
    };
  }

  const strongest = allocs.sort((a, b) => b.value - a.value)[0];
  const rowLabel = rowLabels[strongest.row] || `Origen ${strongest.row + 1}`;
  const colLabel = colLabels[strongest.col] || `Destino ${strongest.col + 1}`;
  const unit = numberValue(costs?.[strongest.row]?.[strongest.col]);

  return {
    title: `La asignación destacada está en ${rowLabel} → ${colLabel} con ${formatNumber(strongest.value)} unidades.`,
    chips: [
      `Cantidad: ${formatNumber(strongest.value)}`,
      `${mode === "max" ? "Beneficio" : "Costo"} unitario: ${formatNumber(unit)}`,
      `${mode === "max" ? "Ganancia" : "Costo"} parcial: ${formatNumber(unit * strongest.value)}`,
    ],
  };
}

function toolbarButtonStyle(variant = "soft") {
  const map = {
    add: {
      background: "linear-gradient(135deg, #7286ff, #8b5cf6)",
      border: "1px solid rgba(191,219,254,0.14)",
      color: "#f8fbff",
    },
    remove: {
      background:
        "linear-gradient(135deg, rgba(37,99,235,0.28), rgba(59,130,246,0.18))",
      border: "1px solid rgba(255,255,255,0.12)",
      color: "#fff7fb",
    },
    solve: {
      background: "linear-gradient(135deg, #38bdf8, #22d3ee)",
      border: "1px solid rgba(255,255,255,0.12)",
      color: "#f8fbff",
    },
    neutral: {
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.14)",
      color: "#dbeafe",
    },
  };

  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 20px",
    borderRadius: 14,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 8px 22px rgba(0,0,0,0.12)",
    ...map[variant],
  };
}

function statCardStyle(accent) {
  return {
    borderRadius: 18,
    padding: "16px 18px",
    background: "rgba(11, 19, 39, 0.82)",
    border: `1px solid ${accent}`,
    boxShadow: "0 12px 26px rgba(0,0,0,0.18)",
  };
}

function sectionCardStyle() {
  return {
    borderRadius: 26,
    padding: 22,
    background:
      "linear-gradient(180deg, rgba(22,30,62,0.8), rgba(17,24,50,0.82))",
    border: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 20px 54px rgba(0,0,0,0.18)",
  };
}

function tableHeadStyle(isCorner = false) {
  return {
    background: isCorner ? "rgba(2,6,23,0.96)" : "rgba(67,76,102,0.72)",
    color: "#ebf4ff",
    border: "1px solid rgba(255,255,255,0.1)",
    padding: "14px 12px",
    textAlign: "center",
    fontSize: 15,
    fontWeight: 500,
  };
}

function tableRowHeaderStyle() {
  return {
    background: "rgba(31, 42, 70, 0.88)",
    color: "#88c4ff",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "14px 12px",
    textAlign: "center",
    minWidth: 120,
    fontSize: 16,
    fontWeight: 500,
  };
}

function tableCellStyle() {
  return {
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "14px 10px",
    textAlign: "center",
    color: "#edf6ff",
    fontSize: 16,
  };
}

function editorInputStyle(variant = "cell") {
  const isHeader = variant === "header";
  const isSupply = variant === "supply";
  const disabled = variant === "disabled";

  return {
    width: "100%",
    minWidth: isHeader ? 120 : 88,
    borderRadius: 10,
    outline: "none",
    border: disabled
      ? "1px dashed rgba(148,163,184,0.22)"
      : isSupply
        ? "1px solid rgba(250,204,21,0.32)"
        : "1px solid rgba(148,163,184,0.14)",
    background: disabled
      ? "rgba(30,41,59,0.48)"
      : isHeader
        ? "rgba(18, 28, 54, 0.82)"
        : isSupply
          ? "rgba(25, 37, 67, 0.92)"
          : "rgba(15, 23, 42, 0.82)",
    color: disabled ? "#94a3b8" : isSupply ? "#f8fafc" : "#edf6ff",
    padding: "10px 12px",
    textAlign: "center",
    fontSize: 15,
    boxSizing: "border-box",
  };
}

function navButtonStyle(disabled) {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    borderRadius: 14,
    padding: "12px 18px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: disabled
      ? "rgba(148,163,184,0.14)"
      : "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(241,245,249,0.96))",
    color: disabled ? "rgba(15,23,42,0.28)" : "#0f172a",
    fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
  };
}

function stepBadgeStyle() {
  return {
    borderRadius: 14,
    padding: "12px 18px",
    background: "rgba(67,82,124,0.56)",
    color: "#f8fbff",
    fontSize: 15,
    fontWeight: 500,
  };
}

function infoChipStyle() {
  return {
    borderRadius: 12,
    background: "rgba(255,255,255,0.06)",
    padding: "10px 14px",
    color: "#d7e7f8",
    fontSize: 14,
  };
}

function ResultSection({ result, series, rowLabels, colLabels, costs, mode }) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    setStepIndex(0);
  }, [result, series]);

  const selected = series[stepIndex] || null;
  if (!result?.ok || !selected?.allocation) return null;

  const allocation = selected.allocation;
  const explanation =
    stepIndex === 0
      ? {
          title:
            mode === "max"
              ? "Solución inicial obtenida desde la esquina noroeste. En modo maximizar se interpreta como ganancia."
              : "Solución inicial obtenida desde la esquina noroeste para iniciar el problema de transporte.",
          chips: [
            `${mode === "max" ? "Ganancia" : "Costo"} total: ${formatNumber(selected.objectiveValue)}`,
            `Expresión: ${selected.objectiveExpression}`,
          ],
        }
      : buildIterationMessage(
          result.iterations?.[stepIndex - 1],
          rowLabels,
          colLabels,
          costs,
          mode,
        );

  return (
    <section style={{ marginTop: 28, display: "grid", gap: 18 }}>
      <div
        style={{
          borderRadius: 28,
          border: "1px solid rgba(125,211,252,0.14)",
          background:
            "linear-gradient(180deg, rgba(7,16,38,0.96), rgba(10,18,38,0.92))",
          padding: 24,
          boxShadow: "0 16px 44px rgba(0,0,0,0.28)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: 16,
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                color: "#e8f3ff",
                fontSize: 34,
                fontWeight: 700,
              }}
            >
              Resultados
            </h2>
            <p style={{ margin: "8px 0 0", color: "#9db4d8", fontSize: 15 }}>
              Si oferta y demanda no coinciden, el sistema balancea
              automáticamente antes de resolver.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))}
              disabled={stepIndex === 0}
              style={navButtonStyle(stepIndex === 0)}
            >
              <ChevronLeft size={18} /> Anterior
            </button>
            <div style={stepBadgeStyle()}>
              Iteración {stepIndex + 1} de {series.length}
            </div>
            <button
              type="button"
              onClick={() =>
                setStepIndex((prev) => Math.min(series.length - 1, prev + 1))
              }
              disabled={stepIndex === series.length - 1}
              style={navButtonStyle(stepIndex === series.length - 1)}
            >
              Siguiente <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div
          style={{
            borderRadius: 18,
            padding: "18px 20px",
            background:
              "linear-gradient(90deg, rgba(8,14,30,0.94), rgba(16,24,46,0.86))",
            border: "1px solid rgba(125,211,252,0.08)",
            display: "flex",
            flexWrap: "wrap",
            gap: 18,
            alignItems: "center",
            color: "#dbeafe",
            fontSize: 15,
            marginBottom: 18,
          }}
        >
          <span>
            <span style={{ color: "#b7cbe8" }}>
              {mode === "max" ? "Ganancia total" : "Costo total"}:
            </span>{" "}
            <strong style={{ color: "#60a5fa", fontSize: 18 }}>
              {formatNumber(selected.objectiveValue)}
            </strong>
          </span>
          <span>
            <span style={{ color: "#b7cbe8" }}>Método:</span>{" "}
            <strong style={{ color: "#60a5fa" }}>
              {stepIndex === 0
                ? "North West Corner"
                : `Solución ${stepIndex + 1}`}
              {mode === "max" ? " (max)" : " (min)"}
            </strong>
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              color: "#facc15",
              fontWeight: 600,
            }}
          >
            <AlertTriangle size={18} /> Esta solución puede no ser óptima
          </span>
        </div>

        <div style={{ marginBottom: 20 }}>
          <h3
            style={{
              margin: "0 0 16px",
              color: "#9cc8ff",
              fontSize: 24,
              fontWeight: 500,
            }}
          >
            Matriz de Asignación Final
          </h3>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                minWidth: 740,
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th style={tableHeadStyle(true)} />
                  {colLabels.map((label, index) => (
                    <th key={`${label}-${index}`} style={tableHeadStyle()}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allocation.map((row, rowIndex) => (
                  <tr key={`alloc-${rowIndex}`}>
                    <th style={tableRowHeaderStyle()}>{rowLabels[rowIndex]}</th>
                    {row.map((value, colIndex) => {
                      const unitCost = numberValue(
                        costs?.[rowIndex]?.[colIndex],
                      );
                      return (
                        <td
                          key={`alloc-cell-${rowIndex}-${colIndex}`}
                          style={{
                            ...tableCellStyle(),
                            ...cellHeatStyle(unitCost, value),
                          }}
                        >
                          <div style={{ fontSize: 18, color: "#edf6ff" }}>
                            {formatNumber(value)}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#d7e7f8",
                              opacity: 0.72,
                            }}
                          >
                            ({formatNumber(unitCost)})
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3
            style={{
              margin: "0 0 14px",
              color: "#9cc8ff",
              fontSize: 24,
              fontWeight: 500,
            }}
          >
            Iteraciones del Algoritmo
          </h3>
          <div
            style={{
              borderRadius: 18,
              background:
                "linear-gradient(180deg, rgba(11,19,40,0.92), rgba(10,16,34,0.94))",
              border: "1px solid rgba(125,211,252,0.1)",
              padding: 18,
            }}
          >
            <div
              style={{
                borderRadius: 14,
                background: "rgba(36, 72, 120, 0.32)",
                borderLeft: "4px solid #56b3ff",
                padding: "16px 18px",
                color: "#edf6ff",
                fontSize: 15,
                lineHeight: 1.45,
              }}
            >
              {explanation?.title}
            </div>

            {explanation?.chips?.length ? (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                  marginTop: 14,
                }}
              >
                {explanation.chips.map((chip) => (
                  <div key={chip} style={infoChipStyle()}>
                    • {chip}
                  </div>
                ))}
              </div>
            ) : null}

            <div style={{ overflowX: "auto", marginTop: 18 }}>
              <table
                style={{
                  width: "100%",
                  minWidth: 700,
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr>
                    <th style={tableHeadStyle(true)} />
                    {colLabels.map((_, index) => (
                      <th key={`step-head-${index}`} style={tableHeadStyle()}>
                        D{index + 1}
                      </th>
                    ))}
                    <th style={tableHeadStyle()}>Oferta Rest.</th>
                  </tr>
                </thead>
                <tbody>
                  {allocation.map((row, rowIndex) => {
                    const supplyLeft =
                      numberValue(result.supply[rowIndex]) -
                      row.reduce((acc, value) => acc + numberValue(value), 0);
                    return (
                      <tr key={`step-row-${rowIndex}`}>
                        <th
                          style={tableRowHeaderStyle()}
                        >{`O${rowIndex + 1}`}</th>
                        {row.map((value, colIndex) => {
                          const highlighted =
                            stepIndex > 0 &&
                            result.iterations?.[stepIndex - 1]?.enteringCell
                              ?.row === rowIndex &&
                            result.iterations?.[stepIndex - 1]?.enteringCell
                              ?.col === colIndex;
                          return (
                            <td
                              key={`step-cell-${rowIndex}-${colIndex}`}
                              style={{
                                ...tableCellStyle(),
                                ...(highlighted
                                  ? {
                                      background: "rgba(250,204,21,0.35)",
                                      boxShadow:
                                        "inset 0 0 0 2px rgba(250,204,21,0.9), 0 0 18px rgba(250,204,21,0.35)",
                                    }
                                  : cellHeatStyle(
                                      costs[rowIndex][colIndex],
                                      value,
                                    )),
                              }}
                            >
                              {formatNumber(value)}
                            </td>
                          );
                        })}
                        <td style={tableCellStyle()}>
                          {formatNumber(supplyLeft)}
                        </td>
                      </tr>
                    );
                  })}
                  <tr>
                    <th style={tableRowHeaderStyle()}>Dem. Rest.</th>
                    {colLabels.map((_, colIndex) => {
                      const allocated = allocation.reduce(
                        (acc, row) => acc + numberValue(row[colIndex]),
                        0,
                      );
                      return (
                        <td
                          key={`remain-${colIndex}`}
                          style={{
                            ...tableCellStyle(),
                            background: "rgba(24, 67, 117, 0.35)",
                          }}
                        >
                          {formatNumber(
                            numberValue(result.demand[colIndex]) - allocated,
                          )}
                        </td>
                      );
                    })}
                    <td style={tableCellStyle()} />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function NorthwestModal({
  open = true,
  onClose,
  nodes = [],
  edges = [],
  dividerX = 400,
  projectName = "Problema de transporte",
  onSaveResult = null,
  embedded = false,
}) {
  const fileInputRef = useRef(null);
  const examples = useMemo(() => getExamples(), []);

  const createEmptyCase = () => ({
    rowLabels: ["Origen 1", "Origen 2", "Origen 3"],
    colLabels: ["Destino 1", "Destino 2", "Destino 3", "Destino 4"],
    supply: [0, 0, 0],
    demand: [0, 0, 0, 0],
    costs: createMatrix(3, 4, 0),
  });

  const [inputMode, setInputMode] = useState("manual");
  const [objectiveMode, setObjectiveMode] = useState("min");
  const [jsonName, setJsonName] = useState("northwest_problema");
  const [maxIterations, setMaxIterations] = useState(6);
  const [showToolsPanel, setShowToolsPanel] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const [rowLabels, setRowLabels] = useState(() => createEmptyCase().rowLabels);
  const [colLabels, setColLabels] = useState(() => createEmptyCase().colLabels);
  const [supply, setSupply] = useState(() => createEmptyCase().supply);
  const [demand, setDemand] = useState(() => createEmptyCase().demand);
  const [costs, setCosts] = useState(() => createEmptyCase().costs);

  const [graphPreview, setGraphPreview] = useState(null);
  const [errors, setErrors] = useState([]);
  const [result, setResult] = useState(null);
  const [solutionSeries, setSolutionSeries] = useState([]);

  useEffect(() => {
    setJsonName(
      projectName
        ? projectName.toLowerCase().replace(/\s+/g, "_")
        : "northwest_problema",
    );
  }, [projectName]);

  useEffect(() => {
    if (inputMode !== "graph") return;
    const preview = buildTransportationInputFromEditor({
      nodes,
      edges,
      dividerX,
      requireCompleteMatrix: true,
    });
    setGraphPreview(preview);
  }, [inputMode, nodes, edges, dividerX]);

  const currentData = useMemo(() => {
    if (inputMode === "graph") {
      if (!graphPreview?.ok) {
        return {
          ok: false,
          errors: graphPreview?.errors || [
            "No se pudieron construir los datos desde la graficadora.",
          ],
        };
      }

      return {
        ok: true,
        costs: graphPreview.costs,
        supply: graphPreview.supply,
        demand: graphPreview.demand,
        rowLabels: graphPreview.rowLabels,
        colLabels: graphPreview.colLabels,
      };
    }

    return {
      ok: true,
      costs,
      supply,
      demand,
      rowLabels,
      colLabels,
    };
  }, [inputMode, graphPreview, costs, supply, demand, rowLabels, colLabels]);

  const balancedPreview = useMemo(() => {
    const base = currentData.ok
      ? currentData
      : { costs, supply, demand, rowLabels, colLabels };

    const balanced = balanceTransportation(
      base.costs,
      base.supply,
      base.demand,
      base.rowLabels,
      base.colLabels,
    );

    return {
      costs: balanced.costs,
      supply: balanced.supply,
      demand: balanced.demand,
      rowLabels:
        balanced.rowLabels.length > 0
          ? balanced.rowLabels
          : [...base.rowLabels],
      colLabels:
        balanced.colLabels.length > 0
          ? balanced.colLabels
          : [...base.colLabels],
      addedType: balanced.addedType,
      difference: balanced.difference,
      wasBalanced: balanced.wasBalanced,
    };
  }, [currentData, costs, supply, demand, rowLabels, colLabels]);

  const totals = useMemo(() => {
    return {
      rows: balancedPreview.costs.length,
      cols: balancedPreview.costs[0]?.length || 0,
      totalSupply: balancedPreview.supply.reduce(
        (acc, value) => acc + numberValue(value),
        0,
      ),
      totalDemand: balancedPreview.demand.reduce(
        (acc, value) => acc + numberValue(value),
        0,
      ),
    };
  }, [balancedPreview]);

  if (!open) return null;

  const setCell = (rowIndex, colIndex, value) => {
    setCosts((prev) =>
      prev.map((row, r) =>
        row.map((cell, c) =>
          r === rowIndex && c === colIndex ? numberValue(value) : cell,
        ),
      ),
    );
  };

  const setSupplyValue = (rowIndex, value) => {
    setSupply((prev) =>
      prev.map((item, index) =>
        index === rowIndex ? numberValue(value) : item,
      ),
    );
  };

  const setDemandValue = (colIndex, value) => {
    setDemand((prev) =>
      prev.map((item, index) =>
        index === colIndex ? numberValue(value) : item,
      ),
    );
  };

  const applyExample = (example) => {
    const data = cloneManualData(example.data);
    setInputMode("manual");
    setRowLabels(data.rowLabels);
    setColLabels(data.colLabels);
    setSupply(data.supply);
    setDemand(data.demand);
    setCosts(data.costs);
    setErrors([]);
    setResult(null);
    setSolutionSeries([]);
    setShowToolsPanel(false);
  };

  const addRow = () => {
    setRowLabels((prev) => [...prev, `Origen ${prev.length + 1}`]);
    setSupply((prev) => [...prev, 0]);
    setCosts((prev) => [...prev, Array(colLabels.length).fill(0)]);
  };

  const addColumn = () => {
    setColLabels((prev) => [...prev, `Destino ${prev.length + 1}`]);
    setDemand((prev) => [...prev, 0]);
    setCosts((prev) => prev.map((row) => [...row, 0]));
  };

  const removeRow = () => {
    if (rowLabels.length <= 1) return;
    setRowLabels((prev) => prev.slice(0, -1));
    setSupply((prev) => prev.slice(0, -1));
    setCosts((prev) => prev.slice(0, -1));
  };

  const removeColumn = () => {
    if (colLabels.length <= 1) return;
    setColLabels((prev) => prev.slice(0, -1));
    setDemand((prev) => prev.slice(0, -1));
    setCosts((prev) => prev.map((row) => row.slice(0, -1)));
  };

  const resetAll = () => {
    const fresh = createEmptyCase();
    setInputMode("manual");
    setObjectiveMode("min");
    setRowLabels(fresh.rowLabels);
    setColLabels(fresh.colLabels);
    setSupply(fresh.supply);
    setDemand(fresh.demand);
    setCosts(fresh.costs);
    setErrors([]);
    setResult(null);
    setSolutionSeries([]);
    setShowToolsPanel(false);
  };

  const solveNow = () => {
    const hasInvalidShape =
      !Array.isArray(costs) ||
      !costs.length ||
      costs.some(
        (row) => !Array.isArray(row) || row.length !== demand.length,
      ) ||
      supply.length !== costs.length;

    if (hasInvalidShape) {
      setErrors([
        "La matriz, la oferta y la demanda no tienen dimensiones válidas.",
      ]);
      return;
    }

    const solved = solveTransportationProblem({
      costs,
      supply,
      demand,
      rowLabels,
      colLabels,
      mode: objectiveMode,
      maxIterations: numberValue(maxIterations, 6),
    });

    if (!solved.ok) {
      setErrors(solved.errors || ["No se pudo resolver el problema."]);
      return;
    }

    const series = getSolutionSeries(solved);
    setErrors([]);
    setResult(solved);
    setSolutionSeries(series);

    onSaveResult?.({
      type: "northwest",
      source: inputMode,
      objectiveMode,
      costs: solved.costs,
      supply: solved.supply,
      demand: solved.demand,
      rowLabels: solved.rowLabels,
      colLabels: solved.colLabels,
      result: solved,
      solutionSeries: series,
    });
  };

  const exportJson = () => {
    const payload = buildNorthwestExportPayload({
      name: jsonName || "northwest",
      mode: objectiveMode,
      source: inputMode,
      costs,
      supply,
      demand,
      rowLabels,
      colLabels,
      result,
    });

    downloadTextFile(
      `${(jsonName || "northwest").trim().replace(/\s+/g, "_")}.json`,
      JSON.stringify(payload, null, 2),
      "application/json",
    );
    setShowExportModal(false);
    setShowToolsPanel(false);
  };

  const handleImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      try {
        const parsed = JSON.parse(String(loadEvent.target?.result || ""));
        if (parsed.type !== "northwest") {
          setErrors(["El archivo no corresponde al formato Northwest."]);
          return;
        }

        const data = parseImportedNorthwest(parsed);
        setInputMode("manual");
        setObjectiveMode(parsed.mode || "min");
        setJsonName(parsed.name || "northwest");
        setRowLabels(data.rowLabels);
        setColLabels(data.colLabels);
        setSupply(data.supply);
        setDemand(data.demand);
        setCosts(data.costs);
        setResult(parsed.result || null);
        setSolutionSeries(
          parsed.result ? getSolutionSeries(parsed.result) : [],
        );
        setErrors([]);
        setShowToolsPanel(false);
      } catch (error) {
        setErrors(["No se pudo importar el archivo JSON."]);
      }
    };

    reader.readAsText(file);
    event.target.value = "";
  };

  const modeButton = (modeValue) => ({
    display: "grid",
    gap: 4,
    minWidth: 180,
    padding: "14px 18px",
    borderRadius: 18,
    border:
      objectiveMode === modeValue
        ? "1px solid rgba(125,211,252,0.42)"
        : "1px solid rgba(148,163,184,0.14)",
    background:
      objectiveMode === modeValue
        ? "linear-gradient(135deg, rgba(59,130,246,0.28), rgba(129,140,248,0.22))"
        : "rgba(9,15,30,0.72)",
    color: "#eff6ff",
    cursor: "pointer",
    boxShadow:
      objectiveMode === modeValue
        ? "0 12px 28px rgba(59,130,246,0.18)"
        : "none",
  });

  const decorativeImageUrl = "";

  const actionButton = (label, icon, onClick, variant = "neutral") => (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...toolbarButtonStyle(variant),
        width: "100%",
        justifyContent: "center",
      }}
    >
      {icon}
      {label}
    </button>
  );

  const content = (
    <div
      style={{
        width: "100%",
        maxWidth: embedded ? "100%" : 1320,
        margin: embedded ? "0 auto" : undefined,
        padding: embedded ? 0 : 8,
        color: "#e8f3ff",
      }}
    >
      <section style={{ ...sectionCardStyle(), overflow: "hidden" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: embedded
              ? "minmax(0, 1fr) minmax(220px, 320px)"
              : "1fr",
            gap: 20,
            alignItems: "stretch",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 24,
                  display: "grid",
                  placeItems: "center",
                  background:
                    "linear-gradient(135deg, rgba(96,165,250,0.18), rgba(167,139,250,0.12))",
                  border: "1px solid rgba(125,211,252,0.18)",
                  boxShadow: "0 0 30px rgba(56,189,248,0.10)",
                }}
              >
                <Grid3X3 size={36} color="#9cd2ff" />
              </div>
              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: embedded ? 36 : 42,
                    fontWeight: 600,
                    letterSpacing: 0.2,
                  }}
                >
                  Algoritmo North West Corner
                </h1>
                <p
                  style={{ margin: "10px 0 0", color: "#a8bdd8", fontSize: 17 }}
                >
                  Método de la esquina noroeste para problemas de transporte.
                </p>
              </div>
            </div>

            <div
              style={{
                marginTop: 22,
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                alignItems: "center",
              }}
            >
              <button
                type="button"
                onClick={() => setObjectiveMode("min")}
                style={modeButton("min")}
              >
                <span style={{ fontSize: 18, fontWeight: 700 }}>Minimizar</span>
                <span style={{ fontSize: 13, color: "#a5c4e8" }}>
                  Usa costos y muestra costo total.
                </span>
              </button>
              <button
                type="button"
                onClick={() => setObjectiveMode("max")}
                style={modeButton("max")}
              >
                <span style={{ fontSize: 18, fontWeight: 700 }}>Maximizar</span>
                <span style={{ fontSize: 13, color: "#a5c4e8" }}>
                  Usa beneficios y muestra ganancia total.
                </span>
              </button>
              <button
                type="button"
                onClick={solveNow}
                style={toolbarButtonStyle("solve")}
              >
                <Play size={18} /> Resolver
              </button>
              <button
                type="button"
                onClick={() => setShowToolsPanel((prev) => !prev)}
                style={{
                  ...toolbarButtonStyle("neutral"),
                  minWidth: 160,
                  justifyContent: "center",
                }}
              >
                {showToolsPanel ? (
                  <ChevronLeft size={18} />
                ) : (
                  <ChevronRight size={18} />
                )}
                Herramientas
              </button>
            </div>
          </div>

          {embedded ? (
            <div
              style={{
                borderRadius: 22,
                minHeight: 190,
                border: "1px solid rgba(148,163,184,0.14)",
                background: decorativeImageUrl
                  ? `linear-gradient(180deg, rgba(10,15,30,0.18), rgba(10,15,30,0.46)), url(${decorativeImageUrl}) center/cover no-repeat`
                  : "linear-gradient(135deg, rgba(9,15,30,0.84), rgba(28,40,74,0.7))",
                display: "grid",
                placeItems: "center",
                padding: 20,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "100%",
                  borderRadius: 16,
                  overflow: "hidden",
                  boxShadow: "0 0 30px rgba(59,130,246,0.2)",
                }}
              >
                <img
                  src="/flor_northwest.jpeg"
                  alt="Northwest visual"
                  style={{
                    width: "100%",
                    height: 260,
                    objectFit: "cover",
                    opacity: 0.85,
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>

        {showToolsPanel ? (
          <div
            style={{
              marginTop: 22,
              padding: 20,
              borderRadius: 20,
              background: "rgba(7, 13, 28, 0.82)",
              border: "1px solid rgba(148,163,184,0.14)",
              display: "grid",
              gap: 18,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12,
              }}
            >
              {actionButton("Agregar fila", <Plus size={18} />, addRow, "add")}
              {actionButton(
                "Agregar columna",
                <Plus size={18} />,
                addColumn,
                "add",
              )}
              {actionButton(
                "Eliminar fila",
                <Trash2 size={18} />,
                removeRow,
                "remove",
              )}
              {actionButton(
                "Eliminar columna",
                <Trash2 size={18} />,
                removeColumn,
                "remove",
              )}
              {actionButton(
                "Cargar ejemplo",
                <Lightbulb size={18} />,
                () => applyExample(examples[0]),
                "neutral",
              )}
              {actionButton(
                "Limpiar matriz",
                <RefreshCcw size={18} />,
                resetAll,
                "neutral",
              )}
              {actionButton(
                "Importar JSON",
                <Upload size={18} />,
                () => fileInputRef.current?.click(),
                "neutral",
              )}
              {actionButton(
                "Exportar JSON",
                <Download size={18} />,
                () => setShowExportModal(true),
                "neutral",
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "#9db4d8", fontSize: 14 }}>
                Máx. iteraciones
              </span>
              <input
                type="number"
                min={1}
                max={20}
                value={displayEditorValue(maxIterations)}
                onChange={(event) =>
                  setMaxIterations(numberValue(event.target.value, 6))
                }
                style={{ ...editorInputStyle(), width: 90, minWidth: 90 }}
              />
            </div>
          </div>
        ) : null}

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          hidden
          onChange={handleImport}
        />
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: embedded
            ? "repeat(auto-fit, minmax(180px, 1fr))"
            : "repeat(auto-fit, minmax(210px, 1fr))",
          gap: 16,
          marginTop: 18,
        }}
      >
        <div style={statCardStyle("rgba(96,165,250,0.18)")}>
          <div
            style={{
              color: "#8fbdf2",
              fontSize: 12,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Filas × columnas
          </div>
          <div style={{ marginTop: 6, fontSize: 28, fontWeight: 700 }}>
            {totals.rows} × {totals.cols}
          </div>
        </div>
        <div style={statCardStyle("rgba(34,197,94,0.16)")}>
          <div
            style={{
              color: "#8fbdf2",
              fontSize: 12,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Balance
          </div>
          <div style={{ marginTop: 6, fontSize: 26, fontWeight: 700 }}>
            {formatNumber(totals.totalSupply)} ={" "}
            {formatNumber(totals.totalDemand)}
          </div>
        </div>
        <div style={statCardStyle("rgba(167,139,250,0.18)")}>
          <div
            style={{
              color: "#8fbdf2",
              fontSize: 12,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Entrada
          </div>
          <div style={{ marginTop: 6, fontSize: 26, fontWeight: 700 }}>
            {inputMode === "graph" ? "Graficadora" : "Manual"}
          </div>
        </div>
      </section>

      <section style={{ ...sectionCardStyle(), marginTop: 18 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 18,
            alignItems: "end",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 26, color: "#e8f3ff" }}>
              Matriz del problema
            </h2>
            <p style={{ margin: "8px 0 0", color: "#9db4d8", fontSize: 15 }}>
              La matriz inicia vacía. Llena costos, oferta y demanda antes de
              resolver.
            </p>
          </div>
          <div
            style={{
              color: balancedPreview.wasBalanced ? "#86efac" : "#fca5a5",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {balancedPreview.wasBalanced
              ? "Balance correcto: ya puedes resolver."
              : balancedPreview.addedType === "column"
                ? `Se agrega automáticamente un destino ficticio por ${formatNumber(balancedPreview.difference)}.`
                : `Se agrega automáticamente un origen ficticio por ${formatNumber(balancedPreview.difference)}.`}
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", minWidth: 860, borderCollapse: "collapse" }}
          >
            <thead>
              <tr>
                <th style={tableHeadStyle(true)} />
                {balancedPreview.colLabels.map((label, index) => (
                  <th key={`${label}-${index}`} style={tableHeadStyle()}>
                    <input
                      value={label}
                      onChange={(event) => {
                        if (index >= colLabels.length) return;
                        setColLabels((prev) =>
                          prev.map((item, i) =>
                            i === index ? event.target.value : item,
                          ),
                        );
                      }}
                      disabled={index >= colLabels.length}
                      style={editorInputStyle(
                        index >= colLabels.length ? "disabled" : "header",
                      )}
                    />
                  </th>
                ))}
                <th style={tableHeadStyle()}>Oferta</th>
              </tr>
            </thead>
            <tbody>
              {balancedPreview.costs.map((row, rowIndex) => (
                <tr key={`editor-row-${rowIndex}`}>
                  <th style={tableRowHeaderStyle()}>
                    <input
                      value={balancedPreview.rowLabels[rowIndex]}
                      onChange={(event) => {
                        if (rowIndex >= rowLabels.length) return;
                        setRowLabels((prev) =>
                          prev.map((item, i) =>
                            i === rowIndex ? event.target.value : item,
                          ),
                        );
                      }}
                      disabled={rowIndex >= rowLabels.length}
                      style={editorInputStyle(
                        rowIndex >= rowLabels.length ? "disabled" : "header",
                      )}
                    />
                  </th>
                  {row.map((value, colIndex) => (
                    <td
                      key={`cost-${rowIndex}-${colIndex}`}
                      style={tableCellStyle()}
                    >
                      <input
                        type="number"
                        value={displayEditorValue(value)}
                        onChange={(event) => {
                          if (
                            rowIndex >= costs.length ||
                            colIndex >= colLabels.length
                          )
                            return;
                          setCell(rowIndex, colIndex, event.target.value);
                        }}
                        disabled={
                          rowIndex >= costs.length ||
                          colIndex >= colLabels.length
                        }
                        style={editorInputStyle(
                          rowIndex >= costs.length ||
                            colIndex >= colLabels.length
                            ? "disabled"
                            : "cell",
                        )}
                      />
                    </td>
                  ))}
                  <td style={tableCellStyle()}>
                    <input
                      type="number"
                      value={displayEditorValue(
                        balancedPreview.supply[rowIndex],
                      )}
                      onChange={(event) => {
                        if (rowIndex >= supply.length) return;
                        setSupplyValue(rowIndex, event.target.value);
                      }}
                      disabled={rowIndex >= supply.length}
                      style={editorInputStyle(
                        rowIndex >= supply.length ? "disabled" : "supply",
                      )}
                    />
                  </td>
                </tr>
              ))}
              <tr>
                <th style={tableRowHeaderStyle()}>Demanda</th>
                {balancedPreview.demand.map((value, colIndex) => (
                  <td
                    key={`demand-${colIndex}`}
                    style={{
                      ...tableCellStyle(),
                      background: "rgba(24, 67, 117, 0.35)",
                    }}
                  >
                    <input
                      type="number"
                      value={displayEditorValue(value)}
                      onChange={(event) => {
                        if (colIndex >= demand.length) return;
                        setDemandValue(colIndex, event.target.value);
                      }}
                      disabled={colIndex >= demand.length}
                      style={editorInputStyle(
                        colIndex >= demand.length ? "disabled" : "supply",
                      )}
                    />
                  </td>
                ))}
                <td
                  style={{
                    ...tableCellStyle(),
                    background: balancedPreview.wasBalanced
                      ? "linear-gradient(135deg, rgba(20,83,45,0.42), rgba(21,128,61,0.22))"
                      : "linear-gradient(135deg, rgba(127,29,29,0.42), rgba(153,27,27,0.22))",
                  }}
                >
                  <div
                    style={{ color: "#d7e7f8", fontSize: 13, lineHeight: 1.7 }}
                  >
                    <div>
                      Σ Oferta:{" "}
                      <span style={{ color: "#86efac" }}>
                        {formatNumber(totals.totalSupply)}
                      </span>
                    </div>
                    <div>
                      Σ Demanda:{" "}
                      <span style={{ color: "#86efac" }}>
                        {formatNumber(totals.totalDemand)}
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {!!errors.length && (
        <section
          style={{
            ...sectionCardStyle(),
            marginTop: 18,
            borderColor: "rgba(248,113,113,0.22)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
              color: "#fecaca",
            }}
          >
            <AlertTriangle size={20} />
            <strong>Corrige esto antes de resolver</strong>
          </div>
          <ul
            style={{
              margin: 0,
              paddingLeft: 18,
              color: "#fca5a5",
              lineHeight: 1.7,
            }}
          >
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </section>
      )}

      <section
        style={{
          ...sectionCardStyle(),
          marginTop: 18,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        <div>
          <h3 style={{ margin: "0 0 10px", fontSize: 20, color: "#cfe5ff" }}>
            Cómo usar Northwest
          </h3>
          <ul
            style={{
              margin: 0,
              paddingLeft: 18,
              color: "#a8bdd8",
              lineHeight: 1.8,
              fontSize: 15,
            }}
          >
            <li>Agrega o elimina filas y columnas desde Herramientas.</li>
            <li>
              Llena costos, oferta y demanda. Si no coinciden, el sistema
              balancea automáticamente con una fila o columna ficticia de costo
              cero.
            </li>
            <li>Usa Minimizar para costos o Maximizar para beneficios.</li>
            <li>
              Presiona Resolver para obtener la solución y las iteraciones paso
              a paso.
            </li>
          </ul>
        </div>
        <div>
          <h3 style={{ margin: "0 0 10px", fontSize: 20, color: "#cfe5ff" }}>
            Notas importantes
          </h3>
          <ul
            style={{
              margin: 0,
              paddingLeft: 18,
              color: "#a8bdd8",
              lineHeight: 1.8,
              fontSize: 15,
            }}
          >
            <li>
              Si oferta y demanda no coinciden, se agrega automáticamente un
              origen o destino ficticio con costo cero para balancear el
              problema.
            </li>
            <li>
              Exportar JSON abre una ventana para que escribas el nombre antes
              de descargar.
            </li>
            <li>
              Importar JSON restaura etiquetas, matriz, modo y resultado
              guardado.
            </li>
            <li>
              Las soluciones adicionales representan mejoras sucesivas
              calculadas con θ.
            </li>
          </ul>
        </div>
      </section>

      <ResultSection
        result={result}
        series={solutionSeries}
        rowLabels={result?.rowLabels || balancedPreview.rowLabels}
        colLabels={result?.colLabels || balancedPreview.colLabels}
        costs={result?.costs || balancedPreview.costs}
        mode={objectiveMode}
      />

      {showExportModal ? (
        <div
          onClick={() => setShowExportModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.56)",
            backdropFilter: "blur(6px)",
            display: "grid",
            placeItems: "center",
            zIndex: 11000,
            padding: 20,
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(520px, 100%)",
              borderRadius: 22,
              background:
                "linear-gradient(180deg, rgba(16,20,34,0.98), rgba(13,18,30,0.98))",
              border: "1px solid rgba(148,163,184,0.18)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
              padding: 28,
            }}
          >
            <h3
              style={{
                margin: 0,
                color: "#ffffff",
                fontSize: 30,
                textAlign: "center",
              }}
            >
              Exportar JSON
            </h3>
            <p
              style={{
                margin: "18px 0 14px",
                color: "#d4d8df",
                fontSize: 16,
                textAlign: "center",
              }}
            >
              Elige el nombre con el que quieres descargar el archivo.
            </p>
            <input
              value={jsonName}
              onChange={(event) => setJsonName(event.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                borderRadius: 12,
                padding: "14px 16px",
                border: "1px solid rgba(191,219,254,0.38)",
                background: "rgba(10,15,26,0.96)",
                color: "#ffffff",
                fontSize: 22,
                fontWeight: 700,
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 14,
                marginTop: 26,
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={exportJson}
                style={toolbarButtonStyle("add")}
              >
                <Download size={18} /> Descargar
              </button>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                style={toolbarButtonStyle("neutral")}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(3,7,18,0.7)",
        backdropFilter: "blur(8px)",
        zIndex: 11000,
        overflowY: "auto",
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "min(1380px, 100%)",
          margin: "0 auto",
          borderRadius: 30,
          background:
            "linear-gradient(180deg, rgba(9,14,28,0.96), rgba(7,10,20,0.98))",
          border: "1px solid rgba(148,163,184,0.18)",
          padding: 24,
          position: "relative",
          boxShadow: "0 26px 80px rgba(0,0,0,0.42)",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            width: 42,
            height: 42,
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.04)",
            color: "#dbeafe",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
          }}
        >
          <X size={18} />
        </button>
        {content}
      </div>
    </div>
  );
}
