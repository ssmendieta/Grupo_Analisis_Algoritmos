class DisjointSet {
  constructor(items) {
    this.parent = new Map();
    this.rank = new Map();

    items.forEach((item) => {
      this.parent.set(item, item);
      this.rank.set(item, 0);
    });
  }

  find(item) {
    const parent = this.parent.get(item);
    if (parent !== item) {
      const root = this.find(parent);
      this.parent.set(item, root);
      return root;
    }
    return parent;
  }

  union(a, b) {
    const rootA = this.find(a);
    const rootB = this.find(b);

    if (rootA === rootB) return false;

    const rankA = this.rank.get(rootA);
    const rankB = this.rank.get(rootB);

    if (rankA < rankB) {
      this.parent.set(rootA, rootB);
    } else if (rankA > rankB) {
      this.parent.set(rootB, rootA);
    } else {
      this.parent.set(rootB, rootA);
      this.rank.set(rootA, rankA + 1);
    }

    return true;
  }
}

const getWeight = (edge) => {
  const value = Number(edge.weight);
  return Number.isFinite(value) ? value : 1;
};

export function runKruskal(nodes, edges, mode = "min") {
  if (!Array.isArray(nodes) || nodes.length < 2) {
    throw new Error("Kruskal necesita al menos 2 nodos para construir un árbol de expansión.");
  }

  const loops = edges.filter((edge) => edge.from === edge.to || edge.isLoop);
  if (loops.length > 0) {
    throw new Error(
      "Kruskal no acepta aristas de un nodo hacia sí mismo. Elimina esos bucles y vuelve a ejecutar.",
    );
  }

  if (!Array.isArray(edges) || edges.length === 0) {
    throw new Error("Agrega aristas con peso antes de ejecutar Kruskal.");
  }

  const nodeIds = nodes.map((node) => node.id);
  const knownNodes = new Set(nodeIds);
  const cleanEdges = edges
    .filter((edge) => knownNodes.has(edge.from) && knownNodes.has(edge.to))
    .map((edge) => ({ ...edge, weight: getWeight(edge) }));

  if (cleanEdges.length === 0) {
    throw new Error("No hay aristas válidas para resolver Kruskal.");
  }

  const sortedEdges = [...cleanEdges].sort((a, b) =>
    mode === "max" ? b.weight - a.weight : a.weight - b.weight,
  );

  const dsu = new DisjointSet(nodeIds);
  const selectedEdges = [];
  const rejectedEdges = [];
  const steps = [];

  sortedEdges.forEach((edge) => {
    const accepted = dsu.union(edge.from, edge.to);
    const step = {
      edgeId: edge.id,
      from: edge.from,
      to: edge.to,
      weight: edge.weight,
      accepted,
    };
    steps.push(step);

    if (accepted) {
      selectedEdges.push(edge);
    } else {
      rejectedEdges.push(edge);
    }
  });

  if (selectedEdges.length !== nodes.length - 1) {
    throw new Error(
      "El grafo no está conectado. Kruskal necesita que todos los nodos puedan conectarse entre sí.",
    );
  }

  const selectedEdgeIds = new Set(selectedEdges.map((edge) => edge.id));
  const selectedNodeIds = new Set();
  selectedEdges.forEach((edge) => {
    selectedNodeIds.add(edge.from);
    selectedNodeIds.add(edge.to);
  });

  const totalWeight = selectedEdges.reduce((sum, edge) => sum + edge.weight, 0);

  return {
    mode,
    totalWeight,
    selectedEdges,
    rejectedEdges,
    selectedEdgeIds,
    selectedNodeIds,
    steps,
  };
}

export function buildKruskalGraphResult(nodes, edges, kruskalResult) {
  return {
    kind: "kruskal",
    mode: kruskalResult.mode === "max" ? "kruskal-max" : "kruskal-min",
    duration: kruskalResult.totalWeight,
    totalWeight: kruskalResult.totalWeight,
    selectedEdgeIds: kruskalResult.selectedEdgeIds,
    selectedNodeIds: kruskalResult.selectedNodeIds,
    nodes: nodes.map((node) => ({
      ...node,
      critical: kruskalResult.selectedNodeIds.has(node.id),
    })),
    edges: edges.map((edge) => ({
      ...edge,
      weight: getWeight(edge),
      highlighted: kruskalResult.selectedEdgeIds.has(edge.id),
      critical: kruskalResult.selectedEdgeIds.has(edge.id),
      slack: "-",
    })),
    highlightPath: [...kruskalResult.selectedNodeIds],
    kruskal: {
      mode: kruskalResult.mode,
      totalWeight: kruskalResult.totalWeight,
      selectedEdges: kruskalResult.selectedEdges,
      steps: kruskalResult.steps,
    },
  };
}
