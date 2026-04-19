import {
  validateTransportationInput,
  calculateTransportationObjective,
  buildObjectiveExpression,
} from "./northwest";

function normalizeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function safeText(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function buildDefaultRowLabels(count) {
  return Array.from({ length: count }, (_, i) => `O${i + 1}`);
}

function buildDefaultColLabels(count) {
  return Array.from({ length: count }, (_, i) => `D${i + 1}`);
}

export function normalizeTransportationManualInput({
  costs,
  supply,
  demand,
  rowLabels = [],
  colLabels = [],
}) {
  const normalizedCosts = (costs || []).map((row) =>
    row.map((v) => normalizeNumber(v)),
  );
  const normalizedSupply = (supply || []).map((v) => normalizeNumber(v));
  const normalizedDemand = (demand || []).map((v) => normalizeNumber(v));

  const rows = normalizedCosts.length;
  const cols = rows > 0 ? normalizedCosts[0].length : 0;

  const finalRowLabels =
    rowLabels.length === rows
      ? rowLabels.map((v, i) => safeText(v, `O${i + 1}`))
      : buildDefaultRowLabels(rows);

  const finalColLabels =
    colLabels.length === cols
      ? colLabels.map((v, i) => safeText(v, `D${i + 1}`))
      : buildDefaultColLabels(cols);

  return {
    costs: normalizedCosts,
    supply: normalizedSupply,
    demand: normalizedDemand,
    rowLabels: finalRowLabels,
    colLabels: finalColLabels,
  };
}

function extractNodeAmount(node, fallback = null) {
  const candidates = [
    node?.amount,
    node?.value,
    node?.offer,
    node?.oferta,
    node?.supply,
    node?.disponibilidad,
    node?.demand,
    node?.demanda,
    node?.data?.amount,
    node?.data?.value,
    node?.data?.offer,
    node?.data?.oferta,
    node?.data?.supply,
    node?.data?.disponibilidad,
    node?.data?.demand,
    node?.data?.demanda,
  ];

  for (const item of candidates) {
    const value = Number(item);
    if (Number.isFinite(value)) return value;
  }

  const label = safeText(node?.label, "");
  const match = label.match(/\[(\-?\d+(?:\.\d+)?)\]$/);
  if (match) {
    const parsed = Number(match[1]);
    if (Number.isFinite(parsed)) return parsed;
  }

  return fallback;
}

function extractEdgeCost(edge, fallback = null) {
  const candidates = [
    edge?.weight,
    edge?.cost,
    edge?.value,
    edge?.data?.weight,
    edge?.data?.cost,
    edge?.data?.value,
    edge?.label,
  ];

  for (const item of candidates) {
    const value = Number(item);
    if (Number.isFinite(value)) return value;
  }

  return fallback;
}

export function splitTransportationNodesByX(nodes, dividerX) {
  const left = [];
  const right = [];

  for (const node of nodes || []) {
    if (Number(node?.x) < dividerX) left.push(node);
    else right.push(node);
  }

  return { sourceNodes: left, targetNodes: right };
}

export function sortNodesTopToBottom(nodes) {
  return [...(nodes || [])].sort((a, b) => {
    const ay = Number(a?.y || 0);
    const by = Number(b?.y || 0);
    if (ay !== by) return ay - by;

    const ax = Number(a?.x || 0);
    const bx = Number(b?.x || 0);
    if (ax !== bx) return ax - bx;

    return String(a?.id).localeCompare(String(b?.id));
  });
}

export function buildTransportationMatrixFromGraph({
  sourceNodes,
  targetNodes,
  edges,
  requireCompleteMatrix = true,
}) {
  const orderedSources = sortNodesTopToBottom(sourceNodes);
  const orderedTargets = sortNodesTopToBottom(targetNodes);

  const rowLabels = orderedSources.map((node, i) =>
    safeText(node?.label, `O${i + 1}`),
  );
  const colLabels = orderedTargets.map((node, i) =>
    safeText(node?.label, `D${i + 1}`),
  );

  const supply = orderedSources.map((node) => extractNodeAmount(node, NaN));
  const demand = orderedTargets.map((node) => extractNodeAmount(node, NaN));

  const rows = orderedSources.length;
  const cols = orderedTargets.length;
  const costs = Array.from({ length: rows }, () => Array(cols).fill(null));

  for (const edge of edges || []) {
    const sourceIndex = orderedSources.findIndex(
      (node) => node.id === edge.from || node.id === edge.to,
    );
    const targetIndex = orderedTargets.findIndex(
      (node) => node.id === edge.to || node.id === edge.from,
    );

    if (sourceIndex === -1 || targetIndex === -1) continue;

    const source = orderedSources[sourceIndex];
    const target = orderedTargets[targetIndex];

    const validDirection =
      (edge.from === source.id && edge.to === target.id) ||
      (edge.to === source.id && edge.from === target.id);

    if (!validDirection) continue;

    const edgeCost = extractEdgeCost(edge, null);
    if (edgeCost === null) continue;

    costs[sourceIndex][targetIndex] = edgeCost;
  }

  const errors = [];

  for (let i = 0; i < supply.length; i++) {
    if (!Number.isFinite(supply[i])) {
      errors.push(
        `El nodo origen "${rowLabels[i]}" no tiene oferta/disponibilidad válida.`,
      );
    }
  }

  for (let j = 0; j < demand.length; j++) {
    if (!Number.isFinite(demand[j])) {
      errors.push(`El nodo destino "${colLabels[j]}" no tiene demanda válida.`);
    }
  }

  if (requireCompleteMatrix) {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (!Number.isFinite(Number(costs[i][j]))) {
          errors.push(
            `Falta un costo/arista entre "${rowLabels[i]}" y "${colLabels[j]}".`,
          );
        }
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    sourceNodes: orderedSources,
    targetNodes: orderedTargets,
    rowLabels,
    colLabels,
    supply: supply.map((v) => normalizeNumber(v, 0)),
    demand: demand.map((v) => normalizeNumber(v, 0)),
    costs: costs.map((row) => row.map((v) => normalizeNumber(v, 0))),
  };
}

export function buildTransportationInputFromEditor({
  nodes,
  edges,
  dividerX,
  requireCompleteMatrix = true,
}) {
  const { sourceNodes, targetNodes } = splitTransportationNodesByX(
    nodes,
    dividerX,
  );

  if (!sourceNodes.length || !targetNodes.length) {
    return {
      ok: false,
      errors: [
        "Debes tener nodos de origen a la izquierda y nodos de destino a la derecha.",
      ],
    };
  }

  return buildTransportationMatrixFromGraph({
    sourceNodes,
    targetNodes,
    edges,
    requireCompleteMatrix,
  });
}

export function buildAllocationMatrixViewModel({
  costs,
  allocation,
  rowLabels = [],
  colLabels = [],
  supply = [],
  demand = [],
  basic = null,
}) {
  const rows = costs.length;
  const cols = rows > 0 ? costs[0].length : 0;

  const finalRowLabels =
    rowLabels.length === rows ? rowLabels : buildDefaultRowLabels(rows);
  const finalColLabels =
    colLabels.length === cols ? colLabels : buildDefaultColLabels(cols);

  const cells = [];

  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      row.push({
        row: i,
        col: j,
        rowLabel: finalRowLabels[i],
        colLabel: finalColLabels[j],
        cost: Number(costs[i][j]),
        allocation: Number(allocation?.[i]?.[j] || 0),
        isBasic: Boolean(basic?.[i]?.[j]),
      });
    }
    cells.push(row);
  }

  return {
    rowLabels: finalRowLabels,
    colLabels: finalColLabels,
    supply: supply.map((v) => Number(v)),
    demand: demand.map((v) => Number(v)),
    cells,
  };
}

export function buildTransportationSummary({
  costs,
  allocation,
  rowLabels = [],
  colLabels = [],
  supply = [],
  demand = [],
  basic = null,
}) {
  return {
    validation: validateTransportationInput(costs, supply, demand),
    objectiveValue: calculateTransportationObjective(costs, allocation),
    objectiveExpression: buildObjectiveExpression(costs, allocation),
    matrixView: buildAllocationMatrixViewModel({
      costs,
      allocation,
      rowLabels,
      colLabels,
      supply,
      demand,
      basic,
    }),
  };
}

export function buildNorthwestExportPayload({
  name = "Problema de transporte",
  mode = "min",
  source = "manual",
  costs,
  supply,
  demand,
  rowLabels = [],
  colLabels = [],
  result = null,
}) {
  return {
    type: "northwest",
    name,
    mode,
    source,
    rowLabels,
    colLabels,
    costs,
    supply,
    demand,
    result,
  };
}
