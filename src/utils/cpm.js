export function runCPM(nodes, edges, isDirected, hasWeights) {
  if (!isDirected) {
    throw new Error("Esta visualización requiere grafo dirigido.");
  }

  if (!hasWeights) {
    throw new Error("Esta visualización requiere pesos.");
  }

  const nodeIds = nodes.map((n) => n.id);

  const cleanEdges = edges.map((e) => ({
    ...e,
    weight:
      e.weight !== null &&
      e.weight !== undefined &&
      !Number.isNaN(Number(e.weight))
        ? Number(e.weight)
        : 1,
  }));

  const incoming = {};
  const outgoing = {};
  const indegree = {};

  nodeIds.forEach((id) => {
    incoming[id] = [];
    outgoing[id] = [];
    indegree[id] = 0;
  });

  for (const edge of cleanEdges) {
    outgoing[edge.from].push(edge);
    incoming[edge.to].push(edge);
    indegree[edge.to] += 1;
  }

  const queue = nodeIds.filter((id) => indegree[id] === 0);
  const topo = [];

  while (queue.length) {
    const u = queue.shift();
    topo.push(u);

    for (const edge of outgoing[u]) {
      indegree[edge.to] -= 1;
      if (indegree[edge.to] === 0) queue.push(edge.to);
    }
  }

  if (topo.length !== nodeIds.length) {
    throw new Error("Para esta vista el grafo debe ser acíclico (DAG).");
  }

  const early = {};
  nodeIds.forEach((id) => (early[id] = 0));

  for (const u of topo) {
    for (const edge of outgoing[u]) {
      early[edge.to] = Math.max(early[edge.to], early[u] + edge.weight);
    }
  }

  const projectDuration = Math.max(...nodeIds.map((id) => early[id]), 0);

  const late = {};
  nodeIds.forEach((id) => (late[id] = projectDuration));

  for (let i = topo.length - 1; i >= 0; i--) {
    const u = topo[i];
    if (outgoing[u].length === 0) {
      late[u] = early[u];
      continue;
    }

    late[u] = Math.min(
      ...outgoing[u].map((edge) => late[edge.to] - edge.weight),
    );
  }

  const nodeSlack = {};
  nodeIds.forEach((id) => {
    nodeSlack[id] = late[id] - early[id];
  });

  const enrichedEdges = cleanEdges.map((edge) => {
    const slack = late[edge.to] - early[edge.from] - edge.weight;
    const critical = slack === 0;
    return {
      ...edge,
      slack,
      critical,
    };
  });

  const enrichedNodes = nodes.map((node) => ({
    ...node,
    early: early[node.id],
    late: late[node.id],
    slack: nodeSlack[node.id],
    critical: nodeSlack[node.id] === 0,
  }));

  const criticalEdges = enrichedEdges.filter((e) => e.critical);

  return {
    duration: projectDuration,
    nodes: enrichedNodes,
    edges: enrichedEdges,
    criticalEdges,
  };
}
