export function buildGraphData(nodes, edges, isDirected, hasWeights) {
  if (!isDirected) {
    throw new Error("Johnson requiere un grafo dirigido.");
  }

  if (!hasWeights) {
    throw new Error("Johnson requiere aristas con peso.");
  }

  const nodeIds = nodes.map((n) => n.id);

  const cleanEdges = edges.map((e) => ({
    from: e.from,
    to: e.to,
    weight:
      e.weight !== null && e.weight !== undefined && !Number.isNaN(Number(e.weight))
        ? Number(e.weight)
        : 1,
  }));

  return { nodeIds, edges: cleanEdges };
}

function bellmanFord(nodeIds, edges, source) {
  const dist = {};
  const prev = {};

  nodeIds.forEach((id) => {
    dist[id] = Infinity;
    prev[id] = null;
  });

  dist[source] = 0;

  for (let i = 0; i < nodeIds.length - 1; i++) {
    let changed = false;

    for (const edge of edges) {
      if (dist[edge.from] !== Infinity && dist[edge.from] + edge.weight < dist[edge.to]) {
        dist[edge.to] = dist[edge.from] + edge.weight;
        prev[edge.to] = edge.from;
        changed = true;
      }
    }

    if (!changed) break;
  }

  for (const edge of edges) {
    if (dist[edge.from] !== Infinity && dist[edge.from] + edge.weight < dist[edge.to]) {
      throw new Error("El grafo contiene un ciclo negativo. Johnson no puede ejecutarse.");
    }
  }

  return { dist, prev };
}

function dijkstra(nodeIds, edges, source) {
  const dist = {};
  const prev = {};
  const visited = new Set();

  nodeIds.forEach((id) => {
    dist[id] = Infinity;
    prev[id] = null;
  });

  dist[source] = 0;

  while (visited.size < nodeIds.length) {
    let current = null;
    let best = Infinity;

    for (const id of nodeIds) {
      if (!visited.has(id) && dist[id] < best) {
        best = dist[id];
        current = id;
      }
    }

    if (current === null) break;

    visited.add(current);

    const outgoing = edges.filter((e) => e.from === current);
    for (const edge of outgoing) {
      const candidate = dist[current] + edge.weight;
      if (candidate < dist[edge.to]) {
        dist[edge.to] = candidate;
        prev[edge.to] = current;
      }
    }
  }

  return { dist, prev };
}

function reconstructPath(prev, source, target) {
  if (source === target) return [source];
  if (!prev[target]) return [];

  const path = [];
  let current = target;

  while (current !== null) {
    path.push(current);
    if (current === source) break;
    current = prev[current];
  }

  path.reverse();

  if (path[0] !== source) return [];
  return path;
}

export function runJohnson(nodes, edges, isDirected, hasWeights) {
  const { nodeIds, edges: cleanEdges } = buildGraphData(nodes, edges, isDirected, hasWeights);

  const q = "__q__";
  const extendedNodes = [...nodeIds, q];
  const extendedEdges = [
    ...cleanEdges,
    ...nodeIds.map((id) => ({ from: q, to: id, weight: 0 })),
  ];

  const { dist: h } = bellmanFord(extendedNodes, extendedEdges, q);

  const reweightedEdges = cleanEdges.map((e) => ({
    ...e,
    weight: e.weight + h[e.from] - h[e.to],
  }));

  const allPairs = {};
  const rawPrev = {};

  for (const source of nodeIds) {
    const { dist, prev } = dijkstra(nodeIds, reweightedEdges, source);
    allPairs[source] = {};
    rawPrev[source] = prev;

    for (const target of nodeIds) {
      if (dist[target] === Infinity) {
        allPairs[source][target] = Infinity;
      } else {
        allPairs[source][target] = dist[target] - h[source] + h[target];
      }
    }
  }

  return {
    distances: allPairs,
    previous: rawPrev,
    potentials: h,
    getPath(source, target) {
      return reconstructPath(rawPrev[source], source, target);
    },
  };
}

function topologicalSort(nodeIds, edges) {
  const inDegree = {};
  nodeIds.forEach((id) => {
    inDegree[id] = 0;
  });

  edges.forEach((e) => {
    inDegree[e.to] += 1;
  });

  const queue = nodeIds.filter((id) => inDegree[id] === 0);
  const order = [];

  while (queue.length) {
    const current = queue.shift();
    order.push(current);

    for (const edge of edges.filter((e) => e.from === current)) {
      inDegree[edge.to] -= 1;
      if (inDegree[edge.to] === 0) queue.push(edge.to);
    }
  }

  if (order.length !== nodeIds.length) {
    throw new Error("Para maximizar tipo CPM el grafo debe ser acíclico (DAG).");
  }

  return order;
}

export function runCriticalPath(nodes, edges, isDirected, hasWeights, start, end) {
  const { nodeIds, edges: cleanEdges } = buildGraphData(nodes, edges, isDirected, hasWeights);

  const order = topologicalSort(nodeIds, cleanEdges);

  const dist = {};
  const prev = {};

  nodeIds.forEach((id) => {
    dist[id] = -Infinity;
    prev[id] = null;
  });

  dist[start] = 0;

  for (const u of order) {
    for (const edge of cleanEdges.filter((e) => e.from === u)) {
      if (dist[u] !== -Infinity && dist[u] + edge.weight > dist[edge.to]) {
        dist[edge.to] = dist[u] + edge.weight;
        prev[edge.to] = u;
      }
    }
  }

  const path = reconstructPath(prev, start, end);

  if (!path.length || dist[end] === -Infinity) {
    throw new Error("No existe una ruta válida entre el origen y el destino.");
  }

  return {
    distance: dist[end],
    path,
    previous: prev,
  };
}