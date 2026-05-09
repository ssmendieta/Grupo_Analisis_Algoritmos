import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Share2,
  Settings,
  Trash2,
  Save,
  Upload,
  X,
  FileJson,
  Download,
  ChevronDown,
  Link,
  Pencil,
} from "lucide-react";

import {
  useNavigate,
  useSearchParams,
  Link as RouterLink,
} from "react-router-dom";

import JohnsonModal from "../components/JohnsonModal.jsx";
import AssignmentModal from "../components/AsignacionModal.jsx";
import MatrizRecursosTareasModal from "../components/MatrizRecursosTareasModal.jsx";
import NorthwestModal from "../components/NorthwestModal.jsx";
import MatrizTransporteModal from "../components/MatrizTransporteModal.jsx";

const GraphEditor = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const tool = useMemo(() => {
    const t = searchParams.get("tool");
    if (
      t === "johnson" ||
      t === "asignacion" ||
      t === "northwest" ||
      t === "editor"
    )
      return t;
    return "editor";
  }, [searchParams]);

  const showNorthwestToolbar = tool === "northwest";
  const isAssignmentOnlyTool = tool === "asignacion";
  const hideEditorSidebar = tool === "northwest";
  const showFreeToolbar = tool === "editor";

  const toolPrevRef = useRef(null);

  const getSaved = (key, fallback) => {
    try {
      const v = sessionStorage.getItem(key);
      return v !== null ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  };

  const [nodes, setNodes] = useState(() => getSaved("graph_nodes", []));
  const [edges, setEdges] = useState(() => getSaved("graph_edges", []));
  const [selectedNode, setSelectedNode] = useState(null);
  const [nextNodeId, setNextNodeId] = useState(() =>
    getSaved("graph_nextId", 1),
  );
  const [isDirected, setIsDirected] = useState(() =>
    getSaved("graph_isDirected", true),
  );
  const [hasWeights, setHasWeights] = useState(() =>
    getSaved("graph_hasWeights", true),
  );
  const [draggedNode, setDraggedNode] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const [showWeightInput, setShowWeightInput] = useState(false);
  const [pendingEdge, setPendingEdge] = useState(null);
  const [weightValue, setWeightValue] = useState(" ");

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const [activeTab, setActiveTab] = useState("export");

  const [showJohnsonModal, setShowJohnsonModal] = useState(false);
  const [algorithmResult, setAlgorithmResult] = useState(null);

  const [assignmentMode, setAssignmentMode] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentResult, setAssignmentResult] = useState(null); 
  const [assignmentMultiNotice, setAssignmentMultiNotice] = useState(null); 
  const [showMatrizRtModal, setShowMatrizRtModal] = useState(false);

  const [northwestMode, setNorthwestMode] = useState(false);
  const [showNorthwestResultsModal, setShowNorthwestResultsModal] =
    useState(false);
  const [northwestResult, setNorthwestResult] = useState(null);

  const canvasRef = useRef(null);
  const [canvasWidth, setCanvasWidth] = useState(800);
  const skipClearRef = useRef(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setCanvasWidth(entry.contentRect.width);
      }
    });
    ro.observe(canvasRef.current);
    return () => ro.disconnect();
  }, []);

  const dividerX = canvasWidth / 2;

  const resourceNodes = useMemo(
    () =>
      assignmentMode || northwestMode
        ? nodes.filter((n) => n.x < dividerX)
        : [],
    [nodes, assignmentMode, northwestMode, dividerX],
  );
  const taskNodes = useMemo(
    () =>
      assignmentMode || northwestMode
        ? nodes.filter((n) => n.x >= dividerX)
        : [],
    [nodes, assignmentMode, northwestMode, dividerX],
  );

  const openAsignacionModal = () => {
    if (!assignmentMode) {
      setHasWeights(true);
      setAlgorithmResult(null);
      setAssignmentResult(null);
      setAssignmentMode(true);
    }
    setShowAssignmentModal(true);
  };

  const exitAssignmentMode = () => {
    if (isAssignmentOnlyTool) {
      navigate("/graficador");
      return;
    }
    setAssignmentMode(false);
  };


  const handleNorthwestResult = (payload) => {
    setNorthwestResult(payload);
    if (payload?.result?.ok) {
      setShowNorthwestResultsModal(true);
    }
  };

  const handleAssignmentResult = (result) => {
    setAssignmentResult(result);
    setShowAssignmentModal(false);
    setShowMatrizRtModal(true);
    const nAlt = result.alternativeSolutions?.length ?? 0;
    if (result.hasMultipleSolutions && nAlt > 1) {
      setAssignmentMultiNotice({
        count: nAlt,
        totalCost: result.totalCost,
        mode: result.mode,
      });
    } else {
      setAssignmentMultiNotice(null);
    }
  };

  useEffect(() => {
    const prev = toolPrevRef.current;

    if (tool === "asignacion") {
      setHasWeights(true);
      setAssignmentMode(true);
      setNorthwestMode(false);
      setAlgorithmResult(null);
      setShowAssignmentModal(false);
    } else if (tool === "northwest") {
      setHasWeights(true);
      setAssignmentMode(false);
      setNorthwestMode(true);
      setAlgorithmResult(null);
    } else if (tool === "johnson") {
      setAssignmentMode(false);
      setNorthwestMode(false);
      setAssignmentResult(null);
      setAssignmentMultiNotice(null);
    } else if (tool === "editor") {
      if (prev === "asignacion") {
        setAssignmentMode(false);
        setAssignmentResult(null);
        setAssignmentMultiNotice(null);
      }
      if (prev === "northwest") {
        setNorthwestMode(false);
      }
    }

    toolPrevRef.current = tool;
  }, [tool]);

  const fileInputRef = useRef(null);

  useEffect(() => {
    sessionStorage.setItem("graph_nodes", JSON.stringify(nodes));
  }, [nodes]);
  useEffect(() => {
    sessionStorage.setItem("graph_edges", JSON.stringify(edges));
  }, [edges]);
  useEffect(() => {
    sessionStorage.setItem("graph_nextId", JSON.stringify(nextNodeId));
  }, [nextNodeId]);
  useEffect(() => {
    sessionStorage.setItem("graph_isDirected", JSON.stringify(isDirected));
  }, [isDirected]);
  useEffect(() => {
    sessionStorage.setItem("graph_hasWeights", JSON.stringify(hasWeights));
  }, [hasWeights]);

  useEffect(() => {
    if (skipClearRef.current) {
      skipClearRef.current = false;
      return;
    }
    setAlgorithmResult(null);
    setAssignmentResult(null);
    setAssignmentMultiNotice(null);
    setShowMatrizRtModal(false);
    setShowNorthwestResultsModal(false);
    setNorthwestResult(null);
  }, [nodes, edges, isDirected, hasWeights]);

  const [contextMenu, setContextMenu] = useState(null);
  const [renameModal, setRenameModal] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [edgeEditModal, setEdgeEditModal] = useState(null);
  const [edgeEditValue, setEdgeEditValue] = useState("");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowMatrizRtModal(false);
        setShowNorthwestResultsModal(false);
        setSelectedNode(null);
        setContextMenu(null);
        setRenameModal(null);
        setEdgeEditModal(null);
        if (showWeightInput) handleWeightCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showWeightInput]);

  const getGraphJSON = () => {
    const data = { isDirected, hasWeights, nodes, edges };
    if (assignmentResult) {
      data.savedAssignmentResult = {
        mode: assignmentResult.mode,
        totalCost: assignmentResult.totalCost,
        hasMultipleSolutions: assignmentResult.hasMultipleSolutions ?? false,
        alternativeSolutions: assignmentResult.alternativeSolutions ?? [],
        assignedEdgeIds: [...assignmentResult.assignedEdgeIds],
        assignedNodeIds: [...assignmentResult.assignedNodeIds],
        resourceNodeIds: assignmentResult.resourceNodeIds ?? [],
        taskNodeIds: assignmentResult.taskNodeIds ?? [],
      };
    }
    if (northwestResult) {
      data.savedNorthwestResult = northwestResult;
    }
    return JSON.stringify(data, null, 2);
  };

  const handleExportDownload = () => {
    const blob = new Blob([getGraphJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const name = prompt("Nombre del archivo") || "grafo.json";
    a.download = name.endsWith(".json") ? name : `${name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (text) => {
    setImportError("");
    try {
      const data = JSON.parse(text);
      if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
        throw new Error('Formato inválido: faltan "nodes" o "edges"');
      }

      setNodes(data.nodes);
      setEdges(data.edges);
      if (typeof data.isDirected === "boolean") setIsDirected(data.isDirected);
      if (typeof data.hasWeights === "boolean") setHasWeights(data.hasWeights);
      const maxId = data.nodes.reduce((m, n) => Math.max(m, n.id), 0);
      setNextNodeId(maxId + 1);
      setSelectedNode(null);
      setAlgorithmResult(null);
      setImportText("");
      setShowSaveModal(false);

      skipClearRef.current = true;

      if (data.savedAssignmentResult) {
        const s = data.savedAssignmentResult;
        setAssignmentResult({
          mode: s.mode,
          totalCost: s.totalCost,
          hasMultipleSolutions: s.hasMultipleSolutions,
          alternativeSolutions: s.alternativeSolutions,
          assignedEdgeIds: new Set(s.assignedEdgeIds),
          assignedNodeIds: new Set(s.assignedNodeIds),
          resourceNodeIds: s.resourceNodeIds,
          taskNodeIds: s.taskNodeIds,
        });
        setAssignmentMode(true);
        setHasWeights(true);
        setAssignmentMultiNotice(
          s.hasMultipleSolutions && s.alternativeSolutions?.length > 1
            ? {
                count: s.alternativeSolutions.length,
                totalCost: s.totalCost,
                mode: s.mode,
              }
            : null,
        );
        setShowMatrizRtModal(true);
      } else {
        setAssignmentResult(null);
        setAssignmentMode(false);
        setAssignmentMultiNotice(null);
        setShowMatrizRtModal(false);
        setShowNorthwestResultsModal(false);
      }

      if (data.savedNorthwestResult) {
        setNorthwestResult(data.savedNorthwestResult);
        setNorthwestMode(true);
        setHasWeights(true);
      } else {
        setNorthwestResult(null);
        if (!data.savedAssignmentResult) setNorthwestMode(false);
      }
    } catch (err) {
      setImportError(err.message);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => handleImportJSON(ev.target.result);
    reader.readAsText(file);
  };

  const handleDoubleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (checkNodeCollision(x, y)) return;
    const newNode = { id: nextNodeId, x, y, label: null };
    setNodes([...nodes, newNode]);
    setNextNodeId(nextNodeId + 1);
  };

  const handleNodeClick = (e, nodeId) => {
    e.stopPropagation();
    closeContextMenu();
    if (hasMoved) {
      setHasMoved(false);
      return;
    }
    if (selectedNode === null) return;

    if (selectedNode === nodeId) {
      const loopEdge = {
        id: `loop-${nodeId}-${Date.now()}`,
        from: nodeId,
        to: nodeId,
        isLoop: true,
        weight: null,
      };
      const loopExists = edges.some(
        (edge) => edge.from === nodeId && edge.to === nodeId,
      );
      if (!loopExists) {
        if (hasWeights) {
          setPendingEdge(loopEdge);
          setWeightValue(" ");
          setShowWeightInput(true);
        } else addEdge(loopEdge);
      }
    } else {
      const newEdge = {
        id: `${selectedNode}-${nodeId}-${Date.now()}`,
        from: selectedNode,
        to: nodeId,
        isLoop: false,
        weight: null,
      };
      if (hasWeights) {
        setPendingEdge(newEdge);
        setWeightValue(" ");
        setShowWeightInput(true);
      } else addEdge(newEdge);
    }
    setSelectedNode(null);
  };

  const closeContextMenu = () => setContextMenu(null);

  const handleContextDelete = () => {
    const { nodeId } = contextMenu;
    setNodes(nodes.filter((n) => n.id !== nodeId));
    setEdges(edges.filter((e) => e.from !== nodeId && e.to !== nodeId));
    if (selectedNode === nodeId) setSelectedNode(null);
    closeContextMenu();
  };

  const handleContextRename = () => {
    const node = nodes.find((n) => n.id === contextMenu.nodeId);
    setRenameValue(node.label || String(node.id));
    setRenameModal({ nodeId: contextMenu.nodeId });
    closeContextMenu();
  };

  const handleContextConnect = () => {
    setSelectedNode(contextMenu.nodeId);
    closeContextMenu();
  };

  const handleRenameConfirm = () => {
    setNodes(
      nodes.map((n) =>
        n.id === renameModal.nodeId
          ? { ...n, label: renameValue.trim() || String(n.id) }
          : n,
      ),
    );
    setRenameModal(null);
    setRenameValue("");
  };

  const handleEdgeRightClick = (e, edgeId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!hasWeights) return;
    const edge = edges.find((ed) => ed.id === edgeId);
    setEdgeEditValue(edge?.weight !== null ? String(edge.weight) : "");
    setEdgeEditModal({ edgeId, x: e.clientX, y: e.clientY });
  };

  const handleEdgeEditConfirm = () => {
    const num = parseFloat(edgeEditValue);
    if (isNaN(num)) return;
    setEdges(
      edges.map((e) =>
        e.id === edgeEditModal.edgeId ? { ...e, weight: num } : e,
      ),
    );
    setEdgeEditModal(null);
    setEdgeEditValue("");
  };

  const handleClear = () => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setNextNodeId(1);
    setAlgorithmResult(null);
    setAssignmentResult(null);
    setAssignmentMultiNotice(null);
    setShowMatrizRtModal(false);
    setNorthwestResult(null);
    setNorthwestMode(false);
    setShowNorthwestResultsModal(false);
    [
      "graph_nodes",
      "graph_edges",
      "graph_nextId",
      "graph_isDirected",
      "graph_hasWeights",
    ].forEach((k) => sessionStorage.removeItem(k));
  };

  const getNodeById = (id) => nodes.find((node) => node.id === id);

  const checkNodeCollision = (x, y, excludeId = null) => {
    const minDistance = 45;
    return nodes.some((node) => {
      if (node.id === excludeId) return false;
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) < minDistance;
    });
  };

  const handleMouseDown = (e, nodeId) => {
    e.stopPropagation();
    setDraggedNode(nodeId);
    setHasMoved(false);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (draggedNode === null) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    if (Math.sqrt(dx * dx + dy * dy) > 5) {
      setHasMoved(true);
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (checkNodeCollision(x, y, draggedNode)) return;
      setNodes(
        nodes.map((node) =>
          node.id === draggedNode ? { ...node, x, y } : node,
        ),
      );
    }
  };

  const handleMouseUp = () => setDraggedNode(null);

  const addEdge = (edge) => {
    const edgeExists = edges.some((e) => {
      if (isDirected) return e.from === edge.from && e.to === edge.to;
      return (
        (e.from === edge.from && e.to === edge.to) ||
        (e.from === edge.to && e.to === edge.from)
      );
    });
    if (!edgeExists) setEdges([...edges, edge]);
  };

  const handleWeightConfirm = () => {
    if (pendingEdge && weightValue)
      addEdge({ ...pendingEdge, weight: parseFloat(weightValue) || 1 });
    setShowWeightInput(false);
    setPendingEdge(null);
    setWeightValue("");
  };

  const handleWeightCancel = () => {
    setShowWeightInput(false);
    setPendingEdge(null);
    setWeightValue(" ");
  };

  const handleMatrizClick = () => {
    if (!hasWeights) {
      alert("No puedes acceder");
      return;
    }

    const ar = assignmentResult;
    const assignmentPayload = ar
      ? {
          assignedPairs: (() => {
            const pairs = [];
            if (!ar.assignedEdgeIds) return pairs;
            for (const edge of edges) {
              if (ar.assignedEdgeIds.has(edge.id)) {
                pairs.push({ from: edge.from, to: edge.to });
              }
            }
            return pairs;
          })(),
          totalCost: ar.totalCost,
          mode: ar.mode,
          hasMultipleSolutions: ar.hasMultipleSolutions ?? false,
          alternativeSolutions: ar.alternativeSolutions ?? [],
          resourceNodeIds: ar.resourceNodeIds ?? [],
          taskNodeIds: ar.taskNodeIds ?? [],
        }
      : null;

    navigate("/matriz", {
      state: {
        nodes,
        edges,
        assignmentResult: assignmentPayload,
      },
    });
  };

  const getNodeDisplay = (node) => node.label || String(node.id);

  const getAssignmentEdgeColor = (edge) => {
    if (!assignmentResult) return "#fff";
    return assignmentResult.assignedEdgeIds?.has(edge.id)
      ? "#10b981"
      : "rgba(255,255,255,0.2)";
  };

  const getAssignmentEdgeWidth = (edge) => {
    if (!assignmentResult) return 2;
    return assignmentResult.assignedEdgeIds?.has(edge.id) ? 3 : 1.5;
  };

  const isNodeResource = (nodeId) => resourceNodes.some((n) => n.id === nodeId);
  const isNodeAssigned = (nodeId) =>
    assignmentResult?.assignedNodeIds?.has(nodeId);

  if (showNorthwestToolbar) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-[#0a0c14] text-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-center justify-between gap-4">
            <button
              onClick={() => navigate("/graficador")}
              className="inline-flex items-center gap-2 rounded-full border border-sky-200/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
            >
              ← Menú
            </button>
            <div className="rounded-full border border-sky-200/10 bg-sky-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-sky-100/80">
              Northwest
            </div>
          </div>

          <NorthwestModal
            open={true}
            onClose={() => navigate("/graficador")}
            nodes={nodes}
            edges={edges}
            dividerX={dividerX}
            projectName="northwest"
            onSaveResult={handleNorthwestResult}
            embedded={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-screen bg-[#0a0c14] text-white font-sans overflow-hidden"
      onClick={closeContextMenu}
    >
      {/* ── SIDEBAR ── */}
      {!hideEditorSidebar && (
        <aside className="w-64 min-w-[16rem] border-r border-white/5 bg-[#0d1117] flex flex-col z-20 shadow-2xl">
          <div className="p-5 border-b border-white/5 flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Share2 size={20} className="text-white" />
            </div>
            <h1 className="font-bold text-lg tracking-tight">
              {tool === "johnson"
                ? "Johnson"
                : tool === "asignacion"
                  ? "Asignación"
                  : tool === "northwest"
                    ? "Northwest"
                    : "Graficador"}
            </h1>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <section>
              <div className="flex items-center gap-2 mb-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                <Settings size={14} />
                Configuración del Grafo
              </div>

              <div className="space-y-4">
                <div
                  className={`flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 ${assignmentMode ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <div>
                    <span className="text-sm font-medium text-gray-300">
                      Con Peso
                    </span>
                    {assignmentMode && tool === "editor" && (
                      <div className="text-xs text-amber-400 mt-0.5">
                        Requerido en asignación
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setHasWeights(!hasWeights)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${hasWeights ? "bg-blue-600" : "bg-gray-700"}`}
                    disabled={assignmentMode}
                  >
                    <div
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${hasWeights ? "translate-x-5" : ""}`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-sm font-medium text-gray-300">
                    Con Dirección
                  </span>
                  <button
                    onClick={() => setIsDirected(!isDirected)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${isDirected ? "bg-blue-600" : "bg-gray-700"}`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isDirected ? "translate-x-5" : ""}`}
                    />
                  </button>
                </div>
              </div>
            </section>

            {/* Info del modo asignación */}
            {assignmentMode && (
              <section>
                <div className="flex items-center gap-2 mb-3 text-xs font-bold text-emerald-500 uppercase tracking-widest">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                  Modo Asignación
                </div>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="text-xs font-bold text-blue-400 mb-1">
                      Recursos
                    </div>
                    <div className="text-xs text-gray-400">
                      {resourceNodes.length} nodo
                      {resourceNodes.length !== 1 ? "s" : ""} detectado
                      {resourceNodes.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <div className="text-xs font-bold text-purple-400 mb-1">
                      Tareas
                    </div>
                    <div className="text-xs text-gray-400">
                      {taskNodes.length} nodo{taskNodes.length !== 1 ? "s" : ""}{" "}
                      detectado{taskNodes.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                  {resourceNodes.length !== taskNodes.length && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <div className="text-xs text-amber-400">
                        ⚠ Matriz no cuadrada — se agregarán{" "}
                        {Math.abs(resourceNodes.length - taskNodes.length)}{" "}
                        {resourceNodes.length < taskNodes.length
                          ? "recurso(s)"
                          : "tarea(s)"}{" "}
                        ficticio(s) automáticamente
                      </div>
                    </div>
                  )}
                  {assignmentResult && tool === "editor" && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <div className="text-xs font-bold text-emerald-400 mb-1">
                        {assignmentResult.mode === "assignment-min"
                          ? "↓ Costo mínimo"
                          : "↑ Beneficio máximo"}
                      </div>
                      <div className="text-lg font-black text-emerald-300">
                        {assignmentResult.totalCost}
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={exitAssignmentMode}
                    className="w-full mt-2 py-2.5 rounded-lg text-xs font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                  >
                    {isAssignmentOnlyTool
                      ? "Volver al menú de herramientas"
                      : "Salir del modo asignación"}
                  </button>
                </div>
              </section>
            )}

            {assignmentResult && (
              <section>
                <div className="flex items-center gap-2 mb-3 text-xs font-bold text-sky-400 uppercase tracking-widest">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                  Matriz recursos × tareas
                </div>
                <button
                  type="button"
                  onClick={() => setShowMatrizRtModal(true)}
                  className="w-full py-3 rounded-xl text-xs font-bold bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 transition-colors"
                >
                  Ver matriz (filas: recursos, columnas: tareas)
                </button>
              </section>
            )}

            {tool === "editor" && (
              <section>
                <div className="flex items-center gap-2 mb-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  Cómo usar
                </div>
                <div className="space-y-2">
                  {[
                    {
                      icon: "🖱️",
                      action: "Doble clic",
                      desc: "en el canvas para crear un nodo",
                    },
                    {
                      icon: "📋",
                      action: "Clic derecho",
                      desc: "en un nodo para ver opciones (conectar, renombrar, eliminar)",
                    },
                    {
                      icon: "🔗",
                      action: "Conectar",
                      desc: 'elige "Conectar" en el menú y luego haz clic en el nodo destino',
                    },
                    {
                      icon: "✏️",
                      action: "Aristas",
                      desc: "clic derecho sobre una arista para editar su peso",
                    },
                    {
                      icon: "✋",
                      action: "Arrastrar",
                      desc: "mantén presionado y mueve para reposicionar nodos",
                    },
                  ].map((step, i) => (
                    <div
                      key={i}
                      className="flex gap-3 p-3 rounded-lg bg-white/3 border border-white/5"
                    >
                      <span className="text-base flex-shrink-0">
                        {step.icon}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-blue-400">
                          {step.action}{" "}
                        </span>
                        <span className="text-xs text-gray-400">
                          {step.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="p-6 border-t border-white/5 space-y-4">
            <button
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-bold transition-all active:scale-95"
              onClick={handleClear}
            >
              <Trash2 size={18} />
              Limpiar Todo
            </button>
          </div>
        </aside>
      )}

      {/* ── MAIN ── */}
      <main className="flex-1 min-w-0 relative flex flex-col">
        {/* Top bar */}
        <div className="h-14 px-4 sm:px-5 border-b border-white/5 bg-[#0d1117] flex items-center justify-between gap-3 flex-shrink-0">
          <RouterLink
            to="/graficador"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10 transition-colors shrink-0"
          >
            <span className="text-lg leading-none">←</span>
            Menú
          </RouterLink>

          <div className="flex items-center justify-end gap-2 flex-wrap min-w-0">
            {showFreeToolbar && (
              <>
                <button
                  onClick={openAsignacionModal}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/25 transition-colors"
                >
                  Asignación
                </button>
                <button
                  onClick={() => setShowJohnsonModal(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/15 px-4 py-2 text-sm font-semibold text-sky-100 hover:bg-sky-500/25 transition-colors"
                >
                  Johnson
                </button>
                <button
                  onClick={() => navigate("/graficador/editor?tool=northwest")}
                  className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/30 bg-fuchsia-500/15 px-4 py-2 text-sm font-semibold text-fuchsia-100 hover:bg-fuchsia-500/25 transition-colors"
                >
                  Northwest
                </button>
              </>
            )}

            {tool === "johnson" && (
              <button
                onClick={() => setShowJohnsonModal(true)}
                className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/15 px-4 py-2 text-sm font-semibold text-sky-100 hover:bg-sky-500/25 transition-colors"
              >
                Solución
              </button>
            )}

            {tool === "asignacion" && (
              <button
                onClick={openAsignacionModal}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-100 hover:bg-emerald-500/25 transition-colors"
              >
                Solución
              </button>
            )}

            {!showNorthwestToolbar && (
              <button
                onClick={handleMatrizClick}
                disabled={!hasWeights}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${hasWeights ? "border border-blue-400/30 bg-blue-500/15 text-blue-100 hover:bg-blue-500/25" : "border border-white/10 bg-white/5 text-slate-500 cursor-not-allowed"}`}
              >
                Matriz
              </button>
            )}

            {!showNorthwestToolbar && (
              <>
                <button
                  onClick={() => {
                    setShowSaveModal(true);
                    setActiveTab("export");
                    setImportError("");
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-white/10 transition-colors"
                >
                  <Save size={14} />
                  Exportar
                </button>
                <button
                  onClick={() => {
                    setShowSaveModal(true);
                    setActiveTab("import");
                    setImportError("");
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-white/10 transition-colors"
                >
                  <Upload size={14} />
                  Importar
                </button>
              </>
            )}
          </div>
        </div>

        {assignmentMultiNotice && (
          <div
            className="flex-shrink-0 px-4 py-2.5 flex items-start justify-between gap-3 border-b border-amber-500/25 bg-amber-500/[0.08] text-amber-50 text-xs sm:text-sm leading-relaxed"
            role="status"
          >
            <span>
              <strong className="text-amber-300">
                Varias soluciones óptimas:
              </strong>{" "}
              hay {assignmentMultiNotice.count} asignaciones distintas con el
              mismo{" "}
              {assignmentMultiNotice.mode === "assignment-min"
                ? "costo mínimo"
                : "beneficio máximo"}{" "}
              (
              <span className="font-mono font-bold">
                {assignmentMultiNotice.totalCost}
              </span>
              ). En el grafo se muestra una de ellas; en la matriz de adyacencia
              verás las celdas de esa asignación resaltadas.
            </span>
            <button
              type="button"
              onClick={() => setAssignmentMultiNotice(null)}
              className="shrink-0 p-1 rounded-md hover:bg-white/10 text-amber-200/90"
              aria-label="Cerrar aviso"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ── Save/Import Modal ── */}
        {showSaveModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9000,
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setShowSaveModal(false)}
          >
            <div
              style={{
                backgroundColor: "#0d1117",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "16px",
                boxShadow: "0 24px 80px rgba(0,0,0,0.9)",
                width: "520px",
                maxWidth: "95vw",
                overflow: "hidden",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  padding: "20px 24px 0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <FileJson size={20} color="#60a5fa" />
                  <span
                    style={{
                      fontWeight: "800",
                      fontSize: "16px",
                      color: "#fff",
                    }}
                  >
                    Guardar / Exportar Grafo
                  </span>
                </div>
                <button
                  onClick={() => setShowSaveModal(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#64748b",
                    cursor: "pointer",
                    padding: "4px",
                  }}
                >
                  <X size={18} />
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "0",
                  padding: "16px 24px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {[
                  ["export", "Exportar", Download],
                  ["import", "Importar", Upload],
                ].map(([tab, label, Icon]) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setImportError("");
                    }}
                    style={{
                      padding: "8px 20px",
                      background: "none",
                      border: "none",
                      borderBottom:
                        activeTab === tab
                          ? "2px solid #3b82f6"
                          : "2px solid transparent",
                      color: activeTab === tab ? "#60a5fa" : "#64748b",
                      fontWeight: "700",
                      fontSize: "13px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginBottom: "-1px",
                      transition: "color 0.15s",
                    }}
                  >
                    <Icon size={14} /> {label}
                  </button>
                ))}
              </div>
              <div style={{ padding: "20px 24px 24px" }}>
                {activeTab === "export" ? (
                  <>
                    <p
                      style={{
                        margin: "0 0 12px",
                        fontSize: "12px",
                        color: "#64748b",
                      }}
                    >
                      JSON del grafo actual — cópialo o descárgalo para guardar
                      tu trabajo.
                    </p>
                    <textarea
                      readOnly
                      value={getGraphJSON()}
                      style={{
                        width: "100%",
                        height: "220px",
                        padding: "12px",
                        backgroundColor: "#070a10",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "10px",
                        color: "#86efac",
                        fontSize: "11.5px",
                        fontFamily: "monospace",
                        resize: "none",
                        boxSizing: "border-box",
                        outline: "none",
                        lineHeight: 1.6,
                      }}
                    />
                    <div
                      style={{ display: "flex", gap: "8px", marginTop: "12px" }}
                    >
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(getGraphJSON())
                        }
                        style={{
                          flex: 1,
                          padding: "10px",
                          backgroundColor: "rgba(255,255,255,0.05)",
                          color: "#94a3b8",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontWeight: "700",
                          fontSize: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        <FileJson size={14} /> Copiar JSON
                      </button>
                      <button
                        onClick={handleExportDownload}
                        style={{
                          flex: 1,
                          padding: "10px",
                          background:
                            "linear-gradient(135deg, #1d4ed8, #7c3aed)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontWeight: "700",
                          fontSize: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        <Download size={14} /> Descargar .json
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p
                      style={{
                        margin: "0 0 12px",
                        fontSize: "12px",
                        color: "#64748b",
                      }}
                    >
                      Pega un JSON exportado anteriormente o sube un archivo{" "}
                      <code style={{ color: "#86efac" }}>.json</code> para
                      restaurar tu grafo.
                    </p>
                    <textarea
                      value={importText}
                      onChange={(e) => {
                        setImportText(e.target.value);
                        setImportError("");
                      }}
                      placeholder="Pega aquí el JSON del grafo..."
                      style={{
                        width: "100%",
                        height: "200px",
                        padding: "12px",
                        backgroundColor: "#070a10",
                        border: `1px solid ${importError ? "#f87171" : "rgba(255,255,255,0.08)"}`,
                        borderRadius: "10px",
                        color: "#e2e8f0",
                        fontSize: "11.5px",
                        fontFamily: "monospace",
                        resize: "none",
                        boxSizing: "border-box",
                        outline: "none",
                        lineHeight: 1.6,
                      }}
                    />
                    {importError && (
                      <p
                        style={{
                          margin: "6px 0 0",
                          fontSize: "11px",
                          color: "#f87171",
                        }}
                      >
                        ⚠ {importError}
                      </p>
                    )}
                    <div
                      style={{ display: "flex", gap: "8px", marginTop: "12px" }}
                    >
                      <button
                        onClick={() => fileInputRef.current.click()}
                        style={{
                          flex: 1,
                          padding: "10px",
                          backgroundColor: "rgba(255,255,255,0.05)",
                          color: "#94a3b8",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontWeight: "700",
                          fontSize: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        <Upload size={14} /> Subir archivo .json
                      </button>
                      <button
                        onClick={() => handleImportJSON(importText)}
                        disabled={!importText.trim()}
                        style={{
                          flex: 1,
                          padding: "10px",
                          background: importText.trim()
                            ? "linear-gradient(135deg, #1d4ed8, #7c3aed)"
                            : "rgba(255,255,255,0.05)",
                          color: importText.trim() ? "#fff" : "#475569",
                          border: "none",
                          borderRadius: "8px",
                          cursor: importText.trim() ? "pointer" : "not-allowed",
                          fontWeight: "700",
                          fontSize: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        <ChevronDown size={14} /> Cargar grafo
                      </button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      style={{ display: "none" }}
                      onChange={handleFileUpload}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── CANVAS ── */}
        {northwestMode && tool === "northwest" ? (
          <div className="flex-1 bg-[#0a0c14] overflow-auto p-5">
            <NorthwestModal
              open={true}
              onClose={() => navigate("/graficador/editor?tool=editor")}
              nodes={nodes}
              edges={edges}
              dividerX={dividerX}
              projectName="Problema de transporte"
              onSaveResult={handleNorthwestResult}
              embedded={true}
            />
          </div>
        ) : (
          <div
            ref={canvasRef}
            className="flex-1 relative bg-[#0a0c14] overflow-hidden"
            onDoubleClick={handleDoubleClick}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Dot grid */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #ffffff10 1px, transparent 1px)",
                backgroundSize: "30px 30px",
              }}
            />

            {/* ── LÍNEA DIVISORIA (modo asignación) ── */}
            {assignmentMode && (
              <>
                {/* Zona izquierda sutil */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: dividerX,
                    bottom: 0,
                    background:
                      "linear-gradient(to right, rgba(59,130,246,0.04), transparent)",
                    pointerEvents: "none",
                  }}
                />
                {/* Zona derecha sutil */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: dividerX,
                    right: 0,
                    bottom: 0,
                    background:
                      "linear-gradient(to left, rgba(167,139,250,0.04), transparent)",
                    pointerEvents: "none",
                  }}
                />
                {/* Línea segmentada */}
                <svg
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                  }}
                >
                  <line
                    x1={dividerX}
                    y1={0}
                    x2={dividerX}
                    y2="100%"
                    stroke="rgba(255,255,255,0.25)"
                    strokeWidth="2"
                    strokeDasharray="8 6"
                  />
                </svg>
                {/* Labels */}
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    left: dividerX / 2,
                    transform: "translateX(-50%)",
                    padding: "4px 14px",
                    borderRadius: 20,
                    background: "rgba(59,130,246,0.15)",
                    border: "1px solid rgba(59,130,246,0.35)",
                    color: "#60a5fa",
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    pointerEvents: "none",
                  }}
                >
                  ◀ Recursos
                </div>
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    left: dividerX + (canvasWidth - dividerX) / 2,
                    transform: "translateX(-50%)",
                    padding: "4px 14px",
                    borderRadius: 20,
                    background: "rgba(167,139,250,0.15)",
                    border: "1px solid rgba(167,139,250,0.35)",
                    color: "#a78bfa",
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    pointerEvents: "none",
                  }}
                >
                  Tareas ▶
                </div>
              </>
            )}

            {/* ── SVG ARISTAS ── */}
            <svg
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
              }}
            >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="6"
                  markerHeight="6"
                  refX="6"
                  refY="3"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <polygon points="0 0, 6 3, 0 6" fill="#fff" />
                </marker>
                <marker
                  id="arrowhead-assigned"
                  markerWidth="6"
                  markerHeight="6"
                  refX="6"
                  refY="3"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <polygon points="0 0, 6 3, 0 6" fill="#10b981" />
                </marker>
              </defs>

              {edges.map((edge) => {
                const fromNode = getNodeById(edge.from);
                const toNode = getNodeById(edge.to);
                if (!fromNode || !toNode) return null;

                let edgeColor, edgeWidth;
                if (assignmentMode) {
                  edgeColor = getAssignmentEdgeColor(edge);
                  edgeWidth = getAssignmentEdgeWidth(edge);
                } else {
                  const resultEdge = algorithmResult?.edges?.find(
                    (e) => e.id === edge.id,
                  );
                  edgeColor = resultEdge?.highlighted
                    ? "#60a5fa"
                    : resultEdge?.critical
                      ? "#ef4444"
                      : "#fff";
                  edgeWidth =
                    resultEdge?.highlighted || resultEdge?.critical ? 4 : 2;
                }

                const resultEdge = !assignmentMode
                  ? algorithmResult?.edges?.find((e) => e.id === edge.id)
                  : null;
                const edgeLabel = resultEdge
                  ? `${edge.weight ?? 1}${resultEdge.slack !== "-" ? ` | h:${resultEdge.slack}` : ""}`
                  : `${edge.weight ?? 1}`;

                const isAssignedEdge =
                  assignmentMode &&
                  assignmentResult?.assignedEdgeIds?.has(edge.id);
                const arrowId = isAssignedEdge
                  ? "url(#arrowhead-assigned)"
                  : "url(#arrowhead)";

                if (edge.isLoop) {
                  const nodeRadius = 30,
                    loopRadius = 50,
                    arrowOffset = isDirected ? 6 : 0;
                  const startAngle = (-3 * Math.PI) / 4;
                  const startX = fromNode.x + nodeRadius * Math.cos(startAngle);
                  const startY = fromNode.y + nodeRadius * Math.sin(startAngle);
                  const endAngle = -Math.PI / 4;
                  const endX =
                    fromNode.x +
                    (nodeRadius + arrowOffset) * Math.cos(endAngle);
                  const endY =
                    fromNode.y +
                    (nodeRadius + arrowOffset) * Math.sin(endAngle);
                  const pathD = `M ${startX} ${startY} C ${fromNode.x - loopRadius} ${fromNode.y - loopRadius * 1.2} ${fromNode.x + loopRadius} ${fromNode.y - loopRadius * 1.2} ${endX} ${endY}`;
                  return (
                    <g
                      key={edge.id}
                      style={{ pointerEvents: "all" }}
                      onContextMenu={(e) => handleEdgeRightClick(e, edge.id)}
                    >
                      <path
                        d={pathD}
                        fill="none"
                        stroke="transparent"
                        strokeWidth="12"
                        style={{ cursor: hasWeights ? "pointer" : "default" }}
                      />
                      <path
                        d={pathD}
                        fill="none"
                        stroke={edgeColor}
                        strokeWidth={edgeWidth}
                        markerEnd={isDirected ? arrowId : ""}
                        style={{ pointerEvents: "none" }}
                      />
                      {hasWeights && (
                        <text
                          x={fromNode.x}
                          y={fromNode.y - loopRadius * 1.2 - 10}
                          fill={edgeColor}
                          fontSize="14"
                          fontWeight="bold"
                          textAnchor="middle"
                          style={{ pointerEvents: "none" }}
                        >
                          {edgeLabel}
                        </text>
                      )}
                    </g>
                  );
                }

                const hasOppositeEdge =
                  isDirected &&
                  edges.some(
                    (e) =>
                      e.from === toNode.id &&
                      e.to === fromNode.id &&
                      e.id !== edge.id,
                  );
                const dx = toNode.x - fromNode.x,
                  dy = toNode.y - fromNode.y;
                const angle = Math.atan2(dy, dx);
                const nodeRadius = 34,
                  arrowOffset = isDirected ? 8 : 0;
                const x1 = fromNode.x + nodeRadius * Math.cos(angle),
                  y1 = fromNode.y + nodeRadius * Math.sin(angle);
                const x2 =
                    toNode.x - (nodeRadius + arrowOffset) * Math.cos(angle),
                  y2 = toNode.y - (nodeRadius + arrowOffset) * Math.sin(angle);
                const curveD = `M ${x1} ${y1} Q ${(x1 + x2) / 2 + (y2 - y1) * 0.2} ${(y1 + y2) / 2 - (x2 - x1) * 0.2} ${x2} ${y2}`;
                const midX =
                  (fromNode.x + toNode.x) / 2 +
                  (hasOppositeEdge ? (y2 - y1) * 0.1 : 0);
                const midY =
                  (fromNode.y + toNode.y) / 2 -
                  (hasOppositeEdge ? (x2 - x1) * 0.1 : 0) -
                  10;

                return (
                  <g
                    key={edge.id}
                    style={{ pointerEvents: "all" }}
                    onContextMenu={(e) => handleEdgeRightClick(e, edge.id)}
                  >
                    {hasOppositeEdge ? (
                      <path
                        d={curveD}
                        fill="none"
                        stroke="transparent"
                        strokeWidth="12"
                        style={{ cursor: hasWeights ? "pointer" : "default" }}
                      />
                    ) : (
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="transparent"
                        strokeWidth="12"
                        style={{ cursor: hasWeights ? "pointer" : "default" }}
                      />
                    )}
                    {hasOppositeEdge ? (
                      <path
                        d={curveD}
                        fill="none"
                        stroke={edgeColor}
                        strokeWidth={edgeWidth}
                        markerEnd={isDirected ? arrowId : ""}
                        style={{ pointerEvents: "none" }}
                      />
                    ) : (
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={edgeColor}
                        strokeWidth={edgeWidth}
                        markerEnd={isDirected ? arrowId : ""}
                        style={{ pointerEvents: "none" }}
                      />
                    )}
                    {hasWeights && (
                      <text
                        x={midX}
                        y={midY}
                        fill={edgeColor}
                        fontSize="14"
                        fontWeight="bold"
                        textAnchor="middle"
                        style={{ pointerEvents: "none" }}
                      >
                        {edgeLabel}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* ── NODOS ── */}
            {nodes.map((node) => {
              const isResource = assignmentMode && isNodeResource(node.id);
              const assigned = assignmentMode && isNodeAssigned(node.id);

              if (assignmentMode) {
                const bgColor = assigned
                  ? "#10b981"
                  : isResource
                    ? "#1d4ed8"
                    : "#7c3aed";
                const borderColor = assigned
                  ? "#34d399"
                  : isResource
                    ? "#60a5fa"
                    : "#a78bfa";
                const glow = assigned
                  ? "0 0 16px rgba(16,185,129,0.6)"
                  : "none";

                return (
                  <div
                    key={node.id}
                    onClick={(e) => handleNodeClick(e, node.id)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (hasMoved) return;
                      setContextMenu({
                        nodeId: node.id,
                        x: e.clientX,
                        y: e.clientY,
                      });
                    }}
                    onMouseDown={(e) => handleMouseDown(e, node.id)}
                    style={{
                      position: "absolute",
                      left: node.x - 22,
                      top: node.y - 22,
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      backgroundColor: bgColor,
                      border: `3px solid ${borderColor}`,
                      boxShadow: glow,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "bold",
                      cursor: draggedNode === node.id ? "grabbing" : "grab",
                      fontSize:
                        node.label && node.label.length > 2 ? "9px" : "12px",
                      userSelect: "none",
                      transition:
                        draggedNode === node.id ? "none" : "box-shadow 0.2s",
                    }}
                  >
                    {getNodeDisplay(node)}
                  </div>
                );
              }

              const resultNode = algorithmResult?.nodes?.find(
                (n) => n.id === node.id,
              );
              const isCriticalNode = !!resultNode?.critical;
              const isHighlightedNode =
                algorithmResult?.highlightPath?.includes(node.id);

              if (!algorithmResult) {
                return (
                  <div
                    key={node.id}
                    onClick={(e) => handleNodeClick(e, node.id)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (hasMoved) return;
                      setContextMenu({
                        nodeId: node.id,
                        x: e.clientX,
                        y: e.clientY,
                      });
                    }}
                    onMouseDown={(e) => handleMouseDown(e, node.id)}
                    style={{
                      position: "absolute",
                      left: node.x - 20,
                      top: node.y - 20,
                      width: "40px",
                      height: "40px",
                      borderRadius: "100%",
                      backgroundColor:
                        selectedNode === node.id ? "#4CAF50" : "#2196F3",
                      border:
                        selectedNode === node.id
                          ? "3px solid #8BC34A"
                          : "3px solid #fff",
                      boxShadow:
                        selectedNode === node.id
                          ? "0 0 12px #4CAF5080"
                          : "0 2px 8px rgba(0,0,0,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "bold",
                      cursor: draggedNode === node.id ? "grabbing" : "grab",
                      transition: draggedNode === node.id ? "none" : "all 0.2s",
                      fontSize:
                        node.label && node.label.length > 2 ? "9px" : "13px",
                      userSelect: "none",
                    }}
                  >
                    {getNodeDisplay(node)}
                  </div>
                );
              }

              const topColor = isHighlightedNode
                ? "#60a5fa"
                : isCriticalNode
                  ? "#ef4444"
                  : "#3b82f6";
              return (
                <div
                  key={node.id}
                  onClick={(e) => handleNodeClick(e, node.id)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (hasMoved) return;
                    setContextMenu({
                      nodeId: node.id,
                      x: e.clientX,
                      y: e.clientY,
                    });
                  }}
                  onMouseDown={(e) => handleMouseDown(e, node.id)}
                  style={{
                    position: "absolute",
                    left: node.x - 34,
                    top: node.y - 28,
                    width: "68px",
                    height: "56px",
                    borderRadius: "12px",
                    overflow: "hidden",
                    cursor: draggedNode === node.id ? "grabbing" : "grab",
                    boxShadow: isCriticalNode
                      ? "0 0 16px #ef444480"
                      : isHighlightedNode
                        ? "0 0 16px #60a5fa80"
                        : "0 4px 12px rgba(0,0,0,0.25)",
                    border: isCriticalNode
                      ? "2px solid #ef4444"
                      : isHighlightedNode
                        ? "2px solid #60a5fa"
                        : "2px solid #ffffff",
                    userSelect: "none",
                    background: "#f8fafc",
                    color: "#111827",
                  }}
                >
                  <div
                    style={{
                      height: "24px",
                      background: topColor,
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      fontSize: "13px",
                    }}
                  >
                    {getNodeDisplay(node)}
                  </div>
                  <div
                    style={{
                      height: "32px",
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      background: "#fef3c7",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRight: "1px solid #d1d5db",
                      }}
                    >
                      {resultNode ? resultNode.early : 0}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {resultNode ? resultNode.late : 0}
                    </div>
                  </div>
                </div>
              );
            })}

            {selectedNode !== null && (
              <div
                style={{
                  position: "absolute",
                  top: 16,
                  left: "50%",
                  transform: "translateX(-50%)",
                  backgroundColor: "#4CAF5020",
                  border: "1px solid #4CAF5060",
                  color: "#8BC34A",
                  padding: "6px 16px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  pointerEvents: "none",
                }}
              >
                Selecciona el nodo destino para conectar ·{" "}
                <span style={{ opacity: 0.7 }}>ESC para cancelar</span>
              </div>
            )}
          </div>
        )}
        {/* ── Context Menu ── */}
        {contextMenu && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: contextMenu.y,
              left: contextMenu.x,
              zIndex: 2000,
              backgroundColor: "#0d1117",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
              overflow: "hidden",
              minWidth: "180px",
            }}
          >
            <div
              style={{
                padding: "8px 12px",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                fontSize: "11px",
                color: "#666",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Nodo{" "}
              {getNodeDisplay(nodes.find((n) => n.id === contextMenu.nodeId))}
            </div>
            {[
              {
                fn: handleContextConnect,
                color: "#60a5fa",
                hover: "rgba(96,165,250,0.1)",
                icon: <Link size={15} />,
                label: "Conectar con otro nodo",
              },
              {
                fn: handleContextRename,
                color: "#a78bfa",
                hover: "rgba(167,139,250,0.1)",
                icon: <Pencil size={15} />,
                label: "Cambiar nombre",
              },
              {
                fn: handleContextDelete,
                color: "#f87171",
                hover: "rgba(248,113,113,0.1)",
                icon: <Trash2 size={15} />,
                label: "Eliminar nodo",
                border: true,
              },
            ].map(({ fn, color, hover, icon, label, border }, i) => (
              <button
                key={i}
                onClick={fn}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 14px",
                  background: "none",
                  border: "none",
                  borderTop: border
                    ? "1px solid rgba(255,255,255,0.05)"
                    : "none",
                  color,
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "500",
                  textAlign: "left",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = hover)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        )}

        {/* ── Edge Edit Modal ── */}
        {edgeEditModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 3000,
            }}
            onClick={() => setEdgeEditModal(null)}
          >
            <div
              style={{
                backgroundColor: "#0d1117",
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "24px",
                borderRadius: "16px",
                boxShadow: "0 16px 48px rgba(0,0,0,0.8)",
                minWidth: "300px",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "15px",
                    fontWeight: "bold",
                    color: "#fff",
                  }}
                >
                  Editar peso de la arista
                </h3>
                <button
                  onClick={() => setEdgeEditModal(null)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#666",
                    cursor: "pointer",
                  }}
                >
                  <X size={18} />
                </button>
              </div>
              <input
                type="number"
                value={edgeEditValue}
                onChange={(e) => setEdgeEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleEdgeEditConfirm();
                  if (e.key === "Escape") setEdgeEditModal(null);
                }}
                autoFocus
                placeholder="Valor numérico..."
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  fontSize: "14px",
                  backgroundColor: "#161b27",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "8px",
                  color: "#fff",
                  boxSizing: "border-box",
                  outline: "none",
                  marginBottom: "8px",
                }}
              />
              {edgeEditValue !== "" && isNaN(parseFloat(edgeEditValue)) && (
                <p
                  style={{
                    margin: "0 0 12px",
                    fontSize: "11px",
                    color: "#f87171",
                  }}
                >
                  ⚠ Solo se permiten valores numéricos
                </p>
              )}
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  justifyContent: "flex-end",
                  marginTop: "8px",
                }}
              >
                <button
                  onClick={() => setEdgeEditModal(null)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    color: "#aaa",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "13px",
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEdgeEditConfirm}
                  disabled={
                    edgeEditValue === "" || isNaN(parseFloat(edgeEditValue))
                  }
                  style={{
                    padding: "8px 16px",
                    backgroundColor:
                      edgeEditValue !== "" && !isNaN(parseFloat(edgeEditValue))
                        ? "#2563eb"
                        : "#1e3a5f",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor:
                      edgeEditValue !== "" && !isNaN(parseFloat(edgeEditValue))
                        ? "pointer"
                        : "not-allowed",
                    fontWeight: "600",
                    fontSize: "13px",
                    opacity:
                      edgeEditValue !== "" && !isNaN(parseFloat(edgeEditValue))
                        ? 1
                        : 0.5,
                  }}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Rename Modal ── */}
        {renameModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 3000,
            }}
            onClick={() => setRenameModal(null)}
          >
            <div
              style={{
                backgroundColor: "#0d1117",
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "24px",
                borderRadius: "16px",
                boxShadow: "0 16px 48px rgba(0,0,0,0.8)",
                minWidth: "300px",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "15px",
                    fontWeight: "bold",
                    color: "#fff",
                  }}
                >
                  Cambiar nombre del nodo
                </h3>
                <button
                  onClick={() => setRenameModal(null)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#666",
                    cursor: "pointer",
                  }}
                >
                  <X size={18} />
                </button>
              </div>
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRenameConfirm();
                  if (e.key === "Escape") setRenameModal(null);
                }}
                autoFocus
                placeholder="Nuevo nombre..."
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  fontSize: "14px",
                  backgroundColor: "#161b27",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "8px",
                  color: "#fff",
                  boxSizing: "border-box",
                  outline: "none",
                  marginBottom: "16px",
                }}
              />
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={() => setRenameModal(null)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    color: "#aaa",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "13px",
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRenameConfirm}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#7c3aed",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "13px",
                  }}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Weight Input Modal ── */}
        {showWeightInput && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
            onClick={handleWeightCancel}
          >
            <div
              style={{
                backgroundColor: "#0a0c14",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                minWidth: "300px",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ marginTop: 0 }}>Peso de la arista</h3>
              <input
                type="number"
                value={weightValue}
                onChange={(e) => setWeightValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleWeightConfirm();
                }}
                autoFocus
                style={{
                  width: "100%",
                  padding: "8px",
                  fontSize: "16px",
                  border: "2px solid #ddd",
                  borderRadius: "4px",
                  marginBottom: "15px",
                  boxSizing: "border-box",
                  color: "#000000",
                }}
              />
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={handleWeightCancel}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#9E9E9E",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleWeightConfirm}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <footer className="h-10 px-6 border-t border-white/5 bg-[#0d1117] flex items-center justify-between text-[10px] text-gray-500 font-mono uppercase tracking-widest">
          <div className="flex gap-6">
            <span className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Nodos: {nodes.length}
            </span>
            <span className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              Aristas: {edges.length}
            </span>
            {assignmentMode && (
              <>
                <span className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Recursos: {resourceNodes.length}
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  Tareas: {taskNodes.length}
                </span>
              </>
            )}
            {assignmentResult && (
              <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {assignmentResult.mode === "assignment-min"
                  ? "Costo mín:"
                  : "Beneficio máx:"}{" "}
                {assignmentResult.totalCost}
              </span>
            )}
            {northwestResult?.result?.ok && (
              <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Northwest: Z {northwestResult.result.objectiveValue}
              </span>
            )}
            {!assignmentMode && !northwestMode && algorithmResult && (
              <span className="flex items-center gap-2">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${algorithmResult.mode === "max" ? "bg-red-500" : "bg-sky-400"}`}
                />
                {algorithmResult.mode === "max"
                  ? `Duración: ${algorithmResult.duration}`
                  : `Resultado: ${algorithmResult.duration}`}
              </span>
            )}
          </div>
        </footer>

        {/* ── Modals ── */}
        <JohnsonModal
          open={showJohnsonModal}
          onClose={() => setShowJohnsonModal(false)}
          nodes={nodes}
          edges={edges}
          isDirected={isDirected}
          hasWeights={hasWeights}
          onApplyResult={setAlgorithmResult}
        />

        <AssignmentModal
          open={showAssignmentModal}
          onClose={() => setShowAssignmentModal(false)}
          resourceNodes={resourceNodes}
          taskNodes={taskNodes}
          edges={edges}
          onApplyResult={handleAssignmentResult}
          initialResult={assignmentResult} // <-- nuevo prop
        />

        <MatrizRecursosTareasModal
          open={showMatrizRtModal}
          onClose={() => setShowMatrizRtModal(false)}
          nodes={nodes}
          edges={edges}
          assignmentResult={assignmentResult}
        />

        <MatrizTransporteModal
          open={showNorthwestResultsModal}
          onClose={() => setShowNorthwestResultsModal(false)}
          title="Resultados del algoritmo Northwest"
          costs={northwestResult?.costs || []}
          supply={northwestResult?.supply || []}
          demand={northwestResult?.demand || []}
          rowLabels={northwestResult?.rowLabels || []}
          colLabels={northwestResult?.colLabels || []}
          result={northwestResult?.result || null}
          solutionSeries={northwestResult?.solutionSeries || []}
          mode={northwestResult?.objectiveMode || "min"}
        />
      </main>
    </div>
  );
};

export default GraphEditor;
