export function orderedNodesByIds(ids, allNodes) {
  if (!ids?.length) return [];
  return ids.map((id) => {
    const n = allNodes.find((x) => x.id === id);
    return n ?? { id, label: String(id) };
  });
}

export function buildAssignmentCostMatrix(resourceNodes, taskNodes, edges) {
  const r = resourceNodes.length;
  const t = taskNodes.length;
  const matrix = Array.from({ length: r }, () => new Array(t).fill(null));
  for (const edge of edges) {
    const ri = resourceNodes.findIndex(
      (n) => n.id === edge.from || n.id === edge.to,
    );
    const ti = taskNodes.findIndex(
      (n) => n.id === edge.to || n.id === edge.from,
    );
    if (ri === -1 || ti === -1) continue;
    const res = resourceNodes[ri];
    const tas = taskNodes[ti];
    const connects =
      (res.id === edge.from && tas.id === edge.to) ||
      (res.id === edge.to && tas.id === edge.from);
    if (connects) matrix[ri][ti] = edge.weight ?? 1;
  }
  return matrix;
}

export function getAssignedRtCellKeys(
  resourceNodes,
  taskNodes,
  edges,
  assignedEdgeIds,
) {
  const set = new Set();
  if (!assignedEdgeIds || typeof assignedEdgeIds.has !== "function") return set;
  for (const edge of edges) {
    if (!assignedEdgeIds.has(edge.id)) continue;
    const ri = resourceNodes.findIndex(
      (n) => n.id === edge.from || n.id === edge.to,
    );
    const ti = taskNodes.findIndex(
      (n) => n.id === edge.to || n.id === edge.from,
    );
    if (ri === -1 || ti === -1) continue;
    const res = resourceNodes[ri];
    const tas = taskNodes[ti];
    if (
      (res.id === edge.from && tas.id === edge.to) ||
      (res.id === edge.to && tas.id === edge.from)
    ) {
      set.add(`${ri},${ti}`);
    }
  }
  return set;
}
