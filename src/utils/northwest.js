const EPSILON = 1e-9;

function nearlyEqual(a, b, eps = EPSILON) {
  return Math.abs(a - b) <= eps;
}

function cloneMatrix(matrix) {
  return matrix.map((row) => [...row]);
}

function createMatrix(rows, cols, fill = 0) {
  return Array.from({ length: rows }, () => Array(cols).fill(fill));
}

function sumArray(arr) {
  return arr.reduce((acc, val) => acc + Number(val || 0), 0);
}

function isFiniteNumber(value) {
  return Number.isFinite(Number(value));
}

export function validateTransportationInput(costs, supply, demand) {
  const errors = [];

  if (!Array.isArray(costs) || costs.length === 0) {
    errors.push("La matriz de costos está vacía.");
  }

  if (!Array.isArray(supply) || supply.length === 0) {
    errors.push("La oferta/disponibilidad está vacía.");
  }

  if (!Array.isArray(demand) || demand.length === 0) {
    errors.push("La demanda está vacía.");
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const rows = costs.length;
  const cols = Array.isArray(costs[0]) ? costs[0].length : 0;

  if (cols === 0) {
    errors.push("La matriz de costos no tiene columnas.");
  }

  if (supply.length !== rows) {
    errors.push(
      `La oferta debe tener ${rows} valores (uno por fila), pero tiene ${supply.length}.`,
    );
  }

  if (demand.length !== cols) {
    errors.push(
      `La demanda debe tener ${cols} valores (uno por columna), pero tiene ${demand.length}.`,
    );
  }

  for (let i = 0; i < rows; i++) {
    if (!Array.isArray(costs[i]) || costs[i].length !== cols) {
      errors.push(`La fila ${i + 1} de la matriz de costos no es rectangular.`);
      continue;
    }
    for (let j = 0; j < cols; j++) {
      const value = Number(costs[i][j]);
      if (!Number.isFinite(value)) {
        errors.push(
          `El costo en la celda (${i + 1}, ${j + 1}) no es numérico.`,
        );
      }
    }
  }

  for (let i = 0; i < supply.length; i++) {
    const value = Number(supply[i]);
    if (!Number.isFinite(value)) {
      errors.push(`La oferta en la fila ${i + 1} no es numérica.`);
    } else if (value < 0) {
      errors.push(`La oferta en la fila ${i + 1} no puede ser negativa.`);
    }
  }

  for (let j = 0; j < demand.length; j++) {
    const value = Number(demand[j]);
    if (!Number.isFinite(value)) {
      errors.push(`La demanda en la columna ${j + 1} no es numérica.`);
    } else if (value < 0) {
      errors.push(`La demanda en la columna ${j + 1} no puede ser negativa.`);
    }
  }

  const totalSupply = sumArray(supply);
  const totalDemand = sumArray(demand);

  if (!nearlyEqual(totalSupply, totalDemand)) {
    errors.push(
      `La oferta total (${totalSupply}) debe ser igual a la demanda total (${totalDemand}).`,
    );
  }

  return {
    ok: errors.length === 0,
    errors,
    rows,
    cols,
    totalSupply,
    totalDemand,
  };
}

export function isBalancedTransportationProblem(supply, demand) {
  return nearlyEqual(sumArray(supply), sumArray(demand));
}

function transformCostsForMode(costs, mode = "min") {
  const numeric = costs.map((row) => row.map((v) => Number(v)));

  if (mode === "max") {
    const maxValue = Math.max(...numeric.flat());
    return numeric.map((row) => row.map((value) => maxValue - value));
  }

  return numeric;
}

export function calculateTransportationObjective(costs, allocation) {
  let total = 0;

  for (let i = 0; i < costs.length; i++) {
    for (let j = 0; j < costs[0].length; j++) {
      total += Number(costs[i][j]) * Number(allocation[i][j] || 0);
    }
  }

  return total;
}

export function buildObjectiveExpression(costs, allocation) {
  const terms = [];

  for (let i = 0; i < costs.length; i++) {
    for (let j = 0; j < costs[0].length; j++) {
      const x = Number(allocation[i][j] || 0);
      if (x > EPSILON) {
        terms.push(`(${x}×${Number(costs[i][j])})`);
      }
    }
  }

  return terms.length ? terms.join(" + ") : "0";
}

function countBasics(basic) {
  let total = 0;
  for (let i = 0; i < basic.length; i++) {
    for (let j = 0; j < basic[0].length; j++) {
      if (basic[i][j]) total++;
    }
  }
  return total;
}

function buildBasisAdjacency(basic) {
  const m = basic.length;
  const n = basic[0].length;
  const totalNodes = m + n;
  const adj = Array.from({ length: totalNodes }, () => []);

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (!basic[i][j]) continue;
      const r = i;
      const c = m + j;
      adj[r].push(c);
      adj[c].push(r);
    }
  }

  return adj;
}

function hasPathBetweenRowAndColumn(basic, rowIndex, colIndex) {
  const m = basic.length;
  const start = rowIndex;
  const target = m + colIndex;
  const adj = buildBasisAdjacency(basic);

  const visited = new Set([start]);
  const queue = [start];

  while (queue.length) {
    const node = queue.shift();
    if (node === target) return true;

    for (const next of adj[node]) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }

  return false;
}

function ensureBasisCardinality(allocation, basic) {
  const m = allocation.length;
  const n = allocation[0].length;
  const needed = m + n - 1;

  while (countBasics(basic) < needed) {
    let added = false;

    for (let i = 0; i < m && !added; i++) {
      for (let j = 0; j < n && !added; j++) {
        if (basic[i][j]) continue;

        // Solo agregamos una básica cero si NO crea ciclo.
        if (!hasPathBetweenRowAndColumn(basic, i, j)) {
          basic[i][j] = true;
          allocation[i][j] = Number(allocation[i][j] || 0);
          added = true;
        }
      }
    }

    if (!added) break;
  }

  return { allocation, basic };
}

export function northwestInitialSolution(costs, supply, demand) {
  const validation = validateTransportationInput(costs, supply, demand);
  if (!validation.ok) {
    throw new Error(validation.errors.join(" "));
  }

  const m = supply.length;
  const n = demand.length;

  const allocation = createMatrix(m, n, 0);
  const basic = createMatrix(m, n, false);

  const supplyLeft = supply.map(Number);
  const demandLeft = demand.map(Number);

  let i = 0;
  let j = 0;

  while (i < m && j < n) {
    const value = Math.min(supplyLeft[i], demandLeft[j]);
    allocation[i][j] = value;
    basic[i][j] = true;

    supplyLeft[i] -= value;
    demandLeft[j] -= value;

    const rowEnded = nearlyEqual(supplyLeft[i], 0);
    const colEnded = nearlyEqual(demandLeft[j], 0);

    if (rowEnded && colEnded) {
      // Degeneración: agregamos una básica cero si existe siguiente celda.
      if (i + 1 < m && j + 1 < n) {
        basic[i][j + 1] = true;
        allocation[i][j + 1] = Number(allocation[i][j + 1] || 0);
      }
      i += 1;
      j += 1;
    } else if (rowEnded) {
      i += 1;
    } else {
      j += 1;
    }
  }

  ensureBasisCardinality(allocation, basic);

  return {
    allocation,
    basic,
    supply: [...supply],
    demand: [...demand],
  };
}

function computePotentials(costs, basic) {
  const m = costs.length;
  const n = costs[0].length;

  const u = Array(m).fill(null);
  const v = Array(n).fill(null);

  u[0] = 0;
  let changed = true;

  while (changed) {
    changed = false;

    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        if (!basic[i][j]) continue;

        if (u[i] !== null && v[j] === null) {
          v[j] = Number(costs[i][j]) - u[i];
          changed = true;
        } else if (u[i] === null && v[j] !== null) {
          u[i] = Number(costs[i][j]) - v[j];
          changed = true;
        }
      }
    }
  }

  // Si queda alguna componente desconectada, la fijamos en 0.
  for (let i = 0; i < m; i++) {
    if (u[i] === null) u[i] = 0;
  }
  for (let j = 0; j < n; j++) {
    if (v[j] === null) v[j] = 0;
  }

  return { u, v };
}

function computeReducedCosts(costs, basic, u, v) {
  const m = costs.length;
  const n = costs[0].length;
  const reduced = createMatrix(m, n, 0);

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      reduced[i][j] = Number(costs[i][j]) - u[i] - v[j];
    }
  }

  return reduced;
}

function chooseEnteringCell(costs, basic, reduced) {
  const m = costs.length;
  const n = costs[0].length;

  let bestValue = 0;
  let bestPos = null;

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (basic[i][j]) continue;

      const delta = reduced[i][j];
      if (delta < bestValue - EPSILON) {
        bestValue = delta;
        bestPos = [i, j];
      }
    }
  }

  return bestPos
    ? {
        row: bestPos[0],
        col: bestPos[1],
        reducedCost: bestValue,
      }
    : null;
}

function findPathInBasis(basic, startRow, targetCol) {
  const m = basic.length;
  const adj = buildBasisAdjacency(basic);

  const start = startRow;
  const target = m + targetCol;

  const parent = Array(m + basic[0].length).fill(-1);
  const visited = new Set([start]);
  const queue = [start];

  while (queue.length) {
    const node = queue.shift();
    if (node === target) break;

    for (const next of adj[node]) {
      if (!visited.has(next)) {
        visited.add(next);
        parent[next] = node;
        queue.push(next);
      }
    }
  }

  if (!visited.has(target)) {
    return null;
  }

  const pathNodes = [];
  let cur = target;

  while (cur !== -1) {
    pathNodes.push(cur);
    cur = parent[cur];
  }

  pathNodes.reverse();
  return pathNodes;
}

function buildCycleFromEnteringCell(basic, enteringRow, enteringCol) {
  const m = basic.length;
  const pathNodes = findPathInBasis(basic, enteringRow, enteringCol);

  if (!pathNodes || pathNodes.length < 2) {
    return null;
  }

  const cycle = [{ row: enteringRow, col: enteringCol }];

  for (let k = 0; k < pathNodes.length - 1; k++) {
    const a = pathNodes[k];
    const b = pathNodes[k + 1];

    if (a < m && b >= m) {
      cycle.push({ row: a, col: b - m });
    } else if (a >= m && b < m) {
      cycle.push({ row: b, col: a - m });
    }
  }

  return cycle;
}

function applyCycleUpdate(allocation, basic, cycle) {
  const updatedAllocation = cloneMatrix(allocation);
  const updatedBasic = basic.map((row) => [...row]);

  const negativeCells = [];
  for (let idx = 1; idx < cycle.length; idx += 2) {
    negativeCells.push(cycle[idx]);
  }

  const theta = Math.min(
    ...negativeCells.map(({ row, col }) =>
      Number(updatedAllocation[row][col] || 0),
    ),
  );

  if (!Number.isFinite(theta) || theta < EPSILON) {
    return null;
  }

  for (let idx = 0; idx < cycle.length; idx++) {
    const { row, col } = cycle[idx];
    if (idx % 2 === 0) {
      updatedAllocation[row][col] += theta;
    } else {
      updatedAllocation[row][col] -= theta;
    }
  }

  const entering = cycle[0];
  updatedBasic[entering.row][entering.col] = true;

  let leavingCell = null;

  for (let idx = 1; idx < cycle.length; idx += 2) {
    const { row, col } = cycle[idx];
    if (nearlyEqual(updatedAllocation[row][col], 0)) {
      updatedAllocation[row][col] = 0;
      leavingCell = { row, col };
      break;
    }
  }

  if (leavingCell) {
    updatedBasic[leavingCell.row][leavingCell.col] = false;
  }

  ensureBasisCardinality(updatedAllocation, updatedBasic);

  return {
    allocation: updatedAllocation,
    basic: updatedBasic,
    theta,
    enteringCell: entering,
    leavingCell,
  };
}

function snapshotIteration({
  iteration,
  costsOriginal,
  costsWorking,
  allocation,
  basic,
  u,
  v,
  reducedCosts,
  entering,
  cycle,
  theta,
  leavingCell,
  mode,
}) {
  return {
    iteration,
    mode,
    allocation: cloneMatrix(allocation),
    basic: basic.map((row) => [...row]),
    objectiveValue: calculateTransportationObjective(costsOriginal, allocation),
    transformedObjectiveValue: calculateTransportationObjective(
      costsWorking,
      allocation,
    ),
    objectiveExpression: buildObjectiveExpression(costsOriginal, allocation),
    potentials: {
      u: [...u],
      v: [...v],
    },
    reducedCosts: cloneMatrix(reducedCosts),
    enteringCell: entering
      ? {
          row: entering.row,
          col: entering.col,
          reducedCost: entering.reducedCost,
        }
      : null,
    cycle: cycle
      ? cycle.map((cell, idx) => ({ ...cell, sign: idx % 2 === 0 ? "+" : "-" }))
      : [],
    theta: theta ?? null,
    leavingCell: leavingCell ?? null,
  };
}

export function solveTransportationProblem({
  costs,
  supply,
  demand,
  mode = "min",
  maxIterations = 10,
}) {
  const validation = validateTransportationInput(costs, supply, demand);

  if (!validation.ok) {
    return {
      ok: false,
      errors: validation.errors,
    };
  }

  const numericCosts = costs.map((row) => row.map(Number));
  const workingCosts = transformCostsForMode(numericCosts, mode);

  const initial = northwestInitialSolution(workingCosts, supply, demand);
  let allocation = cloneMatrix(initial.allocation);
  let basic = initial.basic.map((row) => [...row]);

  const iterations = [];

  for (let iter = 1; iter <= maxIterations; iter++) {
    const { u, v } = computePotentials(workingCosts, basic);
    const reducedCosts = computeReducedCosts(workingCosts, basic, u, v);
    const entering = chooseEnteringCell(workingCosts, basic, reducedCosts);

    if (!entering) {
      iterations.push(
        snapshotIteration({
          iteration: iter,
          costsOriginal: numericCosts,
          costsWorking: workingCosts,
          allocation,
          basic,
          u,
          v,
          reducedCosts,
          entering: null,
          cycle: null,
          theta: null,
          leavingCell: null,
          mode,
        }),
      );

      return {
        ok: true,
        mode,
        balanced: true,
        costs: numericCosts,
        supply: [...supply],
        demand: [...demand],
        initialAllocation: cloneMatrix(initial.allocation),
        allocation: cloneMatrix(allocation),
        basic: basic.map((row) => [...row]),
        objectiveValue: calculateTransportationObjective(
          numericCosts,
          allocation,
        ),
        objectiveExpression: buildObjectiveExpression(numericCosts, allocation),
        transformedObjectiveValue: calculateTransportationObjective(
          workingCosts,
          allocation,
        ),
        iterations,
        hasMoreSolutions: false,
        stopReason:
          "No hay costos reducidos negativos; ya no existe otra mejora.",
      };
    }

    const cycle = buildCycleFromEnteringCell(basic, entering.row, entering.col);

    if (!cycle || cycle.length < 4) {
      iterations.push(
        snapshotIteration({
          iteration: iter,
          costsOriginal: numericCosts,
          costsWorking: workingCosts,
          allocation,
          basic,
          u,
          v,
          reducedCosts,
          entering,
          cycle: null,
          theta: null,
          leavingCell: null,
          mode,
        }),
      );

      return {
        ok: true,
        mode,
        balanced: true,
        costs: numericCosts,
        supply: [...supply],
        demand: [...demand],
        initialAllocation: cloneMatrix(initial.allocation),
        allocation: cloneMatrix(allocation),
        basic: basic.map((row) => [...row]),
        objectiveValue: calculateTransportationObjective(
          numericCosts,
          allocation,
        ),
        objectiveExpression: buildObjectiveExpression(numericCosts, allocation),
        transformedObjectiveValue: calculateTransportationObjective(
          workingCosts,
          allocation,
        ),
        iterations,
        hasMoreSolutions: false,
        stopReason:
          "No se pudo construir un ciclo válido para seguir mejorando.",
      };
    }

    const updated = applyCycleUpdate(allocation, basic, cycle);

    if (!updated) {
      iterations.push(
        snapshotIteration({
          iteration: iter,
          costsOriginal: numericCosts,
          costsWorking: workingCosts,
          allocation,
          basic,
          u,
          v,
          reducedCosts,
          entering,
          cycle,
          theta: null,
          leavingCell: null,
          mode,
        }),
      );

      return {
        ok: true,
        mode,
        balanced: true,
        costs: numericCosts,
        supply: [...supply],
        demand: [...demand],
        initialAllocation: cloneMatrix(initial.allocation),
        allocation: cloneMatrix(allocation),
        basic: basic.map((row) => [...row]),
        objectiveValue: calculateTransportationObjective(
          numericCosts,
          allocation,
        ),
        objectiveExpression: buildObjectiveExpression(numericCosts, allocation),
        transformedObjectiveValue: calculateTransportationObjective(
          workingCosts,
          allocation,
        ),
        iterations,
        hasMoreSolutions: false,
        stopReason: "Theta no permitió generar una nueva solución válida.",
      };
    }

    iterations.push(
      snapshotIteration({
        iteration: iter,
        costsOriginal: numericCosts,
        costsWorking: workingCosts,
        allocation: updated.allocation,
        basic: updated.basic,
        u,
        v,
        reducedCosts,
        entering,
        cycle,
        theta: updated.theta,
        leavingCell: updated.leavingCell,
        mode,
      }),
    );

    allocation = updated.allocation;
    basic = updated.basic;
  }

  return {
    ok: true,
    mode,
    balanced: true,
    costs: numericCosts,
    supply: [...supply],
    demand: [...demand],
    initialAllocation: cloneMatrix(initial.allocation),
    allocation: cloneMatrix(allocation),
    basic: basic.map((row) => [...row]),
    objectiveValue: calculateTransportationObjective(numericCosts, allocation),
    objectiveExpression: buildObjectiveExpression(numericCosts, allocation),
    transformedObjectiveValue: calculateTransportationObjective(
      workingCosts,
      allocation,
    ),
    iterations,
    hasMoreSolutions: true,
    stopReason: `Se alcanzó el máximo de iteraciones permitido (${maxIterations}).`,
  };
}

export function getSolutionSeries(result) {
  if (!result?.ok) return [];

  const solutions = [];

  solutions.push({
    label: "Solución inicial",
    allocation: cloneMatrix(result.initialAllocation),
    objectiveValue: calculateTransportationObjective(
      result.costs,
      result.initialAllocation,
    ),
    objectiveExpression: buildObjectiveExpression(
      result.costs,
      result.initialAllocation,
    ),
    theta: null,
  });

  for (let i = 0; i < (result.iterations || []).length; i++) {
    const step = result.iterations[i];
    if (!step?.allocation) continue;

    solutions.push({
      label: `Solución ${i + 2}`,
      allocation: cloneMatrix(step.allocation),
      objectiveValue: step.objectiveValue,
      objectiveExpression: step.objectiveExpression,
      theta: step.theta,
      enteringCell: step.enteringCell,
      leavingCell: step.leavingCell,
      cycle: step.cycle || [],
    });
  }

  return solutions;
}
