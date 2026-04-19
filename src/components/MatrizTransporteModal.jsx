import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight, X } from "lucide-react";

function numberValue(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function formatNumber(value) {
  const num = Number(value || 0);
  return Number.isInteger(num) ? String(num) : num.toFixed(2);
}

function cellHeatStyle(allocation) {
  if (numberValue(allocation) <= 0) {
    return {
      background: "rgba(8, 15, 35, 0.92)",
      boxShadow: "inset 0 0 0 1px rgba(148,163,184,0.12)",
    };
  }

  const intensity = Math.min(1, 0.25 + numberValue(allocation) / 80);
  return {
    background: `linear-gradient(135deg, rgba(96,165,250,${0.34 + intensity * 0.2}), rgba(34,197,94,${0.08 + intensity * 0.08}))`,
    boxShadow: "inset 0 0 0 1px rgba(96,165,250,0.22)",
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

function infoChipStyle() {
  return {
    borderRadius: 12,
    background: "rgba(255,255,255,0.06)",
    padding: "10px 14px",
    color: "#d7e7f8",
    fontSize: 14,
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

  return {
    title: "Solución inicial generada a partir de la esquina noroeste.",
    chips: [],
  };
}

export default function MatrizTransporteModal({
  open,
  onClose,
  title = "Resultados del algoritmo Northwest",
  costs = [],
  supply = [],
  demand = [],
  rowLabels = [],
  colLabels = [],
  result = null,
  solutionSeries = [],
  mode = "min",
}) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    setStepIndex(0);
  }, [open, result, solutionSeries]);

  const selected = solutionSeries[stepIndex] || null;

  const explanation = useMemo(() => {
    if (!selected?.allocation) return null;
    if (stepIndex === 0) {
      return {
        title:
          mode === "max"
            ? "Solución inicial obtenida desde la esquina noroeste. En modo maximizar se interpreta como ganancia."
            : "Solución inicial obtenida desde la esquina noroeste para iniciar el problema de transporte.",
        chips: [
          `${mode === "max" ? "Ganancia" : "Costo"} total: ${formatNumber(selected.objectiveValue)}`,
          `Expresión: ${selected.objectiveExpression}`,
        ],
      };
    }
    return buildIterationMessage(
      result?.iterations?.[stepIndex - 1],
      rowLabels,
      colLabels,
      costs,
      mode,
    );
  }, [selected, stepIndex, result, rowLabels, colLabels, costs, mode]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 12000,
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(8px)",
        display: "grid",
        placeItems: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "min(1320px, 96vw)",
          maxHeight: "92vh",
          overflow: "auto",
          borderRadius: 28,
          background: "linear-gradient(180deg, #081022, #07111f)",
          border: "1px solid rgba(148,163,184,0.14)",
          padding: 24,
          boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
          position: "relative",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 42,
            height: 42,
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.05)",
            color: "#f8fbff",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
          }}
        >
          <X size={18} />
        </button>

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
              {title}
            </h2>
            <p style={{ margin: "8px 0 0", color: "#9db4d8", fontSize: 15 }}>
              Navega entre la solución inicial y las mejoras calculadas con θ.
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
            <div
              style={{
                borderRadius: 14,
                padding: "12px 18px",
                background: "rgba(67,82,124,0.56)",
                color: "#f8fbff",
                fontSize: 15,
                fontWeight: 500,
              }}
            >
              Iteración {stepIndex + 1} de {solutionSeries.length || 1}
            </div>
            <button
              type="button"
              onClick={() =>
                setStepIndex((prev) =>
                  Math.min((solutionSeries.length || 1) - 1, prev + 1),
                )
              }
              disabled={stepIndex >= (solutionSeries.length || 1) - 1}
              style={navButtonStyle(
                stepIndex >= (solutionSeries.length || 1) - 1,
              )}
            >
              Siguiente <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {!selected?.allocation ? (
          <p style={{ color: "#cbd5e1" }}>
            Todavía no hay resultados para mostrar.
          </p>
        ) : (
          <>
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

            <div style={{ overflowX: "auto", marginBottom: 20 }}>
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
                  {selected.allocation.map((row, rowIndex) => (
                    <tr key={`alloc-${rowIndex}`}>
                      <th style={tableRowHeaderStyle()}>
                        {rowLabels[rowIndex]}
                      </th>
                      {row.map((value, colIndex) => (
                        <td
                          key={`alloc-${rowIndex}-${colIndex}`}
                          style={{
                            ...tableCellStyle(),
                            ...cellHeatStyle(value),
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
                            ({formatNumber(costs[rowIndex]?.[colIndex])})
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
                        <th
                          key={`iter-head-${index}`}
                          style={tableHeadStyle()}
                        >{`D${index + 1}`}</th>
                      ))}
                      <th style={tableHeadStyle()}>Oferta Rest.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.allocation.map((row, rowIndex) => {
                      const supplyLeft =
                        numberValue(supply[rowIndex]) -
                        row.reduce((acc, value) => acc + numberValue(value), 0);
                      return (
                        <tr key={`iter-row-${rowIndex}`}>
                          <th
                            style={tableRowHeaderStyle()}
                          >{`O${rowIndex + 1}`}</th>
                          {row.map((value, colIndex) => {
                            const highlighted =
                              stepIndex > 0 &&
                              result?.iterations?.[stepIndex - 1]?.enteringCell
                                ?.row === rowIndex &&
                              result?.iterations?.[stepIndex - 1]?.enteringCell
                                ?.col === colIndex;
                            return (
                              <td
                                key={`iter-cell-${rowIndex}-${colIndex}`}
                                style={{
                                  ...tableCellStyle(),
                                  ...(highlighted
                                    ? {
                                        background: "rgba(250,204,21,0.35)",
                                        boxShadow:
                                          "inset 0 0 0 2px rgba(250,204,21,0.9), 0 0 18px rgba(250,204,21,0.35)",
                                      }
                                    : cellHeatStyle(value)),
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
                        const allocated = selected.allocation.reduce(
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
                              numberValue(demand[colIndex]) - allocated,
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
          </>
        )}
      </div>
    </div>
  );
}
