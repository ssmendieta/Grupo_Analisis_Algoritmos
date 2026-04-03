
export function asignacion(costMatrix, mode = 'min') {
  if (!costMatrix.length || !costMatrix[0].length)
    throw new Error('La matriz de costos está vacía.');

  const rows = costMatrix.length;
  const cols = costMatrix[0].length;
  const n    = Math.max(rows, cols);

  // Pad a cuadrada con ceros
  const originalPad = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) =>
      i < rows && j < cols ? costMatrix[i][j] : 0
    )
  );

  let mat = originalPad.map(row => [...row]);

  if (mode === 'max') {
    const maxVal = Math.max(...mat.flat());
    mat = mat.map(row => row.map(v => maxVal - v));
  }

  // Paso 1: restar mínimo de cada fila
  mat = mat.map(row => { const m = Math.min(...row); return row.map(v => v - m); });

  // Paso 2: restar mínimo de cada columna
  for (let j = 0; j < n; j++) {
    const m = Math.min(...mat.map(r => r[j]));
    for (let i = 0; i < n; i++) mat[i][j] -= m;
  }

  // Pasos 3-4: iterar hasta tener n líneas de cobertura
  let iters = 0;
  while (true) {
    if (++iters > 500) break;
    const { rowCover, colCover } = coverZeros(mat, n);
    if (rowCover.filter(Boolean).length + colCover.filter(Boolean).length >= n) break;

    let minU = Infinity;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        if (!rowCover[i] && !colCover[j]) minU = Math.min(minU, mat[i][j]);

    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        if (!rowCover[i] && !colCover[j]) mat[i][j] -= minU;
        if ( rowCover[i] &&  colCover[j]) mat[i][j] += minU;
      }
  }

  // La matriz reducida final (mat) define los ceros óptimos
  const reducedMat = mat;

  // Asignación principal
  const primaryAssignment = findAssignment(reducedMat, n);
  const optimalCost = calcCost(primaryAssignment, originalPad, n);

  // Enumerar TODAS las asignaciones perfectas sobre los ceros
  // que tengan el mismo costo óptimo → soluciones alternativas
  const allSolutions = [];
  enumerateAssignments(reducedMat, n, originalPad, optimalCost, allSolutions, 200);

  // Garantizar que la principal esté siempre incluida
  const primaryKey = primaryAssignment.join(',');
  if (!allSolutions.some(s => s.join(',') === primaryKey))
    allSolutions.unshift(primaryAssignment);

  return {
    assignment: primaryAssignment,
    totalCost: optimalCost,
    matrix: originalPad,
    n,
    paddedRows: n - rows,
    paddedCols: n - cols,
    originalRows: rows,
    originalCols: cols,
    alternativeSolutions: allSolutions,   // todas con el mismo costo óptimo
    hasMultipleSolutions: allSolutions.length > 1,
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────

function calcCost(assignment, matrix, n) {
  let cost = 0;
  for (let i = 0; i < n; i++)
    if (assignment[i] !== -1) cost += matrix[i][assignment[i]];
  return cost;
}

/**
 * Backtracking sobre ceros de la matriz reducida.
 * Solo conserva asignaciones cuyo costo == optimalCost.
 */
function enumerateAssignments(reducedMat, n, originalMat, optimalCost, results, maxResults) {
  const current  = new Array(n).fill(-1);
  const colUsed  = new Array(n).fill(false);

  function bt(row) {
    if (results.length >= maxResults) return;
    if (row === n) {
      if (Math.abs(calcCost(current, originalMat, n) - optimalCost) < 1e-9)
        results.push([...current]);
      return;
    }
    for (let j = 0; j < n; j++) {
      if (Math.abs(reducedMat[row][j]) < 1e-9 && !colUsed[j]) {
        current[row] = j;
        colUsed[j]   = true;
        bt(row + 1);
        colUsed[j]   = false;
        current[row] = -1;
      }
    }
  }

  bt(0);
}

function coverZeros(mat, n) {
  const rowAssign = new Array(n).fill(-1);
  const colAssign = new Array(n).fill(-1);

  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      if (mat[i][j] === 0 && colAssign[j] === -1) {
        rowAssign[i] = j; colAssign[j] = i; break;
      }

  for (let i = 0; i < n; i++)
    if (rowAssign[i] === -1) {
      const vis = new Array(n).fill(false);
      augment(i, mat, rowAssign, colAssign, vis, n);
    }

  const markedRows = rowAssign.map(j => j === -1);
  const markedCols = new Array(n).fill(false);

  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < n; i++)
      if (markedRows[i])
        for (let j = 0; j < n; j++)
          if (mat[i][j] === 0 && !markedCols[j]) { markedCols[j] = true; changed = true; }
    for (let j = 0; j < n; j++)
      if (markedCols[j] && colAssign[j] !== -1 && !markedRows[colAssign[j]])
        { markedRows[colAssign[j]] = true; changed = true; }
  }

  return { rowCover: markedRows.map(m => !m), colCover: markedCols };
}

function augment(i, mat, rowAssign, colAssign, vis, n) {
  for (let j = 0; j < n; j++) {
    if (mat[i][j] === 0 && !vis[j]) {
      vis[j] = true;
      const prev = colAssign[j];
      if (prev === -1 || augment(prev, mat, rowAssign, colAssign, vis, n)) {
        rowAssign[i] = j; colAssign[j] = i; return true;
      }
    }
  }
  return false;
}

function findAssignment(mat, n) {
  const rowAssign = new Array(n).fill(-1);
  const colAssign = new Array(n).fill(-1);
  const colUsed   = new Array(n).fill(false);

  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      if (mat[i][j] === 0 && !colUsed[j]) {
        rowAssign[i] = j; colAssign[j] = i; colUsed[j] = true; break;
      }

  for (let i = 0; i < n; i++)
    if (rowAssign[i] === -1) {
      const vis = new Array(n).fill(false);
      augment(i, mat, rowAssign, colAssign, vis, n);
    }

  return rowAssign;
}