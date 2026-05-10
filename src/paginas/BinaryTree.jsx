import { useState, useRef } from "react";
import {
  Plus,
  Download,
  Upload,
  Shuffle,
  X,
  RotateCcw,
  GitBranch,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  insertNode,
  inorder,
  preorder,
  postorder,
  generateRandomTree,
  reconstructFromInPost,
  validateInPost,
  serializeTree,
  deserializeTree,
  computeLayout,
} from "../utils/binaryTree";

const C = {
  bg: "#060c1c",
  border: "rgba(255,255,255,0.08)",
  accent: "#38bdf8",
  accentDim: "rgba(56,189,248,0.12)",
  accentBorder: "rgba(56,189,248,0.25)",
  white: "#ffffff",
  muted: "#94a3b8",
  green: "#4ade80",
  orange: "#f97316",
  red: "#f87171",
  indigo: "#818cf8",
  inputBg: "rgba(255,255,255,0.06)",
  inputBorder: "rgba(255,255,255,0.14)",
};

const NODE_R = 22;
const H_GAP = 54;
const V_GAP = 70;

function TreeSVG({ root, highlightValues = [] }) {
  if (!root) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: C.muted,
          flexDirection: "column",
          gap: 12,
        }}
      >
        <GitBranch size={48} opacity={0.25} />
        <p style={{ fontSize: 14, opacity: 0.5 }}>
          El árbol está vacío. Inserta un nodo para comenzar.
        </p>
      </div>
    );
  }

  const positions = computeLayout(root);
  const vals = Object.values(positions);
  const maxX = Math.max(...vals.map((p) => p.x));
  const maxY = Math.max(...vals.map((p) => p.y));
  const W = (maxX + 1) * H_GAP + NODE_R * 4;
  const H = (maxY + 1) * V_GAP + NODE_R * 4;
  const px = (x) => x * H_GAP + NODE_R * 2;
  const py = (y) => y * V_GAP + NODE_R * 2;

  const edges = [];
  const nodes = [];

  function walk(node) {
    if (!node) return;
    const p = positions[node.value];
    if (node.left) {
      const lp = positions[node.left.value];
      edges.push(
        <line
          key={`e-${node.value}-L`}
          x1={px(p.x)}
          y1={py(p.y)}
          x2={px(lp.x)}
          y2={py(lp.y)}
          stroke={C.accentBorder}
          strokeWidth={1.5}
        />,
      );
    }
    if (node.right) {
      const rp = positions[node.right.value];
      edges.push(
        <line
          key={`e-${node.value}-R`}
          x1={px(p.x)}
          y1={py(p.y)}
          x2={px(rp.x)}
          y2={py(rp.y)}
          stroke={C.accentBorder}
          strokeWidth={1.5}
        />,
      );
    }
    const hl = highlightValues.includes(node.value);
    nodes.push(
      <g key={`n-${node.value}`}>
        <circle
          cx={px(p.x)}
          cy={py(p.y)}
          r={NODE_R}
          fill={hl ? C.orange : C.accentDim}
          stroke={hl ? C.orange : C.accent}
          strokeWidth={hl ? 2.5 : 1.5}
          style={{
            filter: hl
              ? `drop-shadow(0 0 8px ${C.orange}80)`
              : `drop-shadow(0 0 6px ${C.accent}40)`,
          }}
        />
        <text
          x={px(p.x)}
          y={py(p.y)}
          textAnchor="middle"
          dominantBaseline="central"
          fill={C.white}
          fontSize={12}
          fontWeight={700}
          fontFamily="monospace"
        >
          {node.value}
        </text>
      </g>,
    );
    walk(node.left);
    walk(node.right);
  }
  walk(root);

  return (
    <div
      style={{
        flex: 1,
        overflow: "auto",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
      }}
    >
      <svg
        width={Math.max(W, 300)}
        height={Math.max(H, 200)}
        style={{ minWidth: "100%" }}
      >
        {edges}
        {nodes}
      </svg>
    </div>
  );
}

function RandomModal({ onClose, onGenerate }) {
  const [count, setCount] = useState("7");
  const [min, setMin] = useState("1");
  const [max, setMax] = useState("99");
  const [err, setErr] = useState("");

  const fieldStyle = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 10,
    border: `1px solid ${C.inputBorder}`,
    background: C.inputBg,
    color: C.white,
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box",
  };
  const labelStyle = {
    display: "block",
    marginBottom: 6,
    fontSize: 11,
    fontWeight: 700,
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
  };

  const handle = () => {
    const n = parseInt(count),
      mn = parseInt(min),
      mx = parseInt(max);
    if (isNaN(n) || n < 1) return setErr("Cantidad de nodos inválida.");
    if (isNaN(mn) || isNaN(mx)) return setErr("Rango de valores inválido.");
    if (mn > mx) return setErr("El mínimo no puede ser mayor que el máximo.");
    if (mx - mn + 1 < n)
      return setErr(`El rango [${mn}, ${mx}] no tiene ${n} valores únicos.`);
    try {
      onGenerate(n, mn, mx);
      onClose();
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(460px,94vw)",
          background: "rgba(8,16,36,0.97)",
          border: `1px solid ${C.accentBorder}`,
          borderRadius: 22,
          padding: 28,
          color: C.white,
          boxShadow: `0 24px 80px rgba(0,0,0,0.55), 0 0 0 1px ${C.accentBorder}`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 22,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.22em",
                color: C.accent,
                marginBottom: 4,
              }}
            >
              Configuración
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 800,
                color: C.white,
              }}
            >
              Árbol Aleatorio
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: `1px solid ${C.border}`,
              cursor: "pointer",
              color: C.muted,
              borderRadius: "50%",
              width: 34,
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          <div>
            <label style={labelStyle}>Cantidad de nodos</label>
            <input
              value={count}
              onChange={(e) => setCount(e.target.value)}
              type="number"
              min="1"
              style={fieldStyle}
            />
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label style={labelStyle}>Valor mínimo</label>
              <input
                value={min}
                onChange={(e) => setMin(e.target.value)}
                type="number"
                style={fieldStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Valor máximo</label>
              <input
                value={max}
                onChange={(e) => setMax(e.target.value)}
                type="number"
                style={fieldStyle}
              />
            </div>
          </div>
        </div>

        {err && (
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
              marginTop: 14,
              background: "rgba(248,113,113,0.10)",
              border: "1px solid rgba(248,113,113,0.25)",
              borderRadius: 10,
              padding: "9px 12px",
            }}
          >
            <AlertCircle
              size={14}
              style={{ color: C.red, flexShrink: 0, marginTop: 1 }}
            />
            <p
              style={{ margin: 0, color: C.red, fontSize: 12, lineHeight: 1.4 }}
            >
              {err}
            </p>
          </div>
        )}

        <button
          onClick={handle}
          style={{
            width: "100%",
            marginTop: 20,
            padding: "13px",
            borderRadius: 12,
            background: C.accent,
            color: "#0c1e2e",
            border: "none",
            cursor: "pointer",
            fontWeight: 800,
            fontSize: 15,
          }}
        >
          Generar árbol
        </button>
      </div>
    </div>
  );
}

export default function BinaryTreePage() {
  const [root, setRoot] = useState(null);
  const [insertVal, setInsertVal] = useState("");
  const [insertErr, setInsertErr] = useState("");
  const [showRandom, setShowRandom] = useState(false);
  const [traversalResult, setTraversalResult] = useState(null);
  const [highlightValues, setHighlightValues] = useState([]);
  const [inorderInput, setInorderInput] = useState("");
  const [postorderInput, setPostorderInput] = useState("");
  const [reconstructErr, setReconstructErr] = useState("");
  const [reconstructOk, setReconstructOk] = useState(false);
  const fileRef = useRef();

  const btnBase = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "9px 14px",
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 13,
  };

  const handleInsert = () => {
    const val = parseInt(insertVal);
    if (isNaN(val)) return setInsertErr("Ingresa un número válido.");
    setRoot((prev) => insertNode(structuredClone(prev), val));
    setInsertVal("");
    setInsertErr("");
    setTraversalResult(null);
    setHighlightValues([]);
    setReconstructOk(false);
  };

  const handleGenerate = (n, mn, mx) => {
    setRoot(generateRandomTree(n, mn, mx));
    setTraversalResult(null);
    setHighlightValues([]);
    setInsertErr("");
    setReconstructOk(false);
  };

  const traversalColors = {
    inorder: "#0ea5e9",
    preorder: "#4ade80",
    postorder: "#f97316",
  };

  const runTraversal = (type) => {
    if (!root) return;
    if (traversalResult?.type === type) {
      setTraversalResult(null);
      setHighlightValues([]);
    } else {
      const fns = { inorder, preorder, postorder };
      const vals = fns[type](root);
      setTraversalResult({ type, values: vals });
      setHighlightValues(vals);
    }
  };

  const handleExport = () => {
    const name = prompt("Nombre del archivo:", "arbol_binario");
    if (!name) return;
    const blob = new Blob(
      [JSON.stringify({ tree: serializeTree(root) }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.replace(/\.json$/i, "")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        setRoot(deserializeTree(JSON.parse(ev.target.result).tree));
        setTraversalResult(null);
        setHighlightValues([]);
        setInsertErr("");
        setReconstructOk(false);
      } catch {
        setInsertErr("Archivo inválido.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleReset = () => {
    setRoot(null);
    setTraversalResult(null);
    setHighlightValues([]);
    setInsertErr("");
    setInsertVal("");
    setReconstructOk(false);
    setReconstructErr("");
    setInorderInput("");
    setPostorderInput("");
  };

  const parseSeq = (str) =>
    str
      .trim()
      .replace(/[[\]]/g, "")
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number);

  const handleReconstruct = () => {
    setReconstructErr("");
    setReconstructOk(false);
    const inArr = parseSeq(inorderInput);
    const postArr = parseSeq(postorderInput);
    if (inArr.some(isNaN) || postArr.some(isNaN))
      return setReconstructErr("Ambas secuencias deben contener solo números.");
    if (!inArr.length || !postArr.length)
      return setReconstructErr("Ingresa ambas secuencias.");
    const check = validateInPost(inArr, postArr);
    if (!check.valid) return setReconstructErr(check.error);
    try {
      setRoot(reconstructFromInPost(inArr, postArr));
      setTraversalResult(null);
      setHighlightValues([]);
      setReconstructOk(true);
    } catch (e) {
      setReconstructErr(e.message);
    }
  };

  const traversalBtns = [
    { type: "inorder", label: "Inorder", color: traversalColors.inorder },
    { type: "preorder", label: "Preorder", color: traversalColors.preorder },
    { type: "postorder", label: "Postorder", color: traversalColors.postorder },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.white,
        fontFamily: "system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "22px 24px 10px",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: "0.28em",
          }}
        >
          ÁRBOL BINARIO
        </h1>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          gap: 20,
          padding: "12px 24px 24px",
          minHeight: 0,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            background: "rgba(15,23,42,0.6)",
            border: `1px dashed ${C.border}`,
            borderRadius: 32,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              flex: 1,
              padding: 20,
              overflow: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <TreeSVG root={root} highlightValues={highlightValues} />
          </div>
        </div>

        <div
          style={{
            width: 280,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            overflowY: "auto",
          }}
        >
          <div
            style={{
              background: "rgba(15,23,42,0.8)",
              border: `1px solid ${C.border}`,
              borderRadius: 24,
              padding: 18,
            }}
          >
            <p
              style={{
                margin: "0 0 12px",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                color: C.muted,
              }}
            >
              Construir árbol
            </p>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <input
                value={insertVal}
                onChange={(e) => setInsertVal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleInsert()}
                placeholder="Número..."
                type="number"
                style={{
                  flex: 1,
                  padding: "9px 12px",
                  borderRadius: 10,
                  border: `1px solid ${C.inputBorder}`,
                  background: C.inputBg,
                  color: C.white,
                  fontSize: 14,
                  outline: "none",
                }}
              />
              <button
                onClick={handleInsert}
                style={{
                  ...btnBase,
                  background: C.accent,
                  color: "#0c1e2e",
                  padding: "9px 14px",
                }}
              >
                <Plus size={16} />
              </button>
            </div>
            {insertErr && (
              <p style={{ margin: "0 0 8px", color: C.red, fontSize: 12 }}>
                {insertErr}
              </p>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              <button
                onClick={handleExport}
                style={{
                  ...btnBase,
                  background: "rgba(74,222,128,0.12)",
                  color: C.green,
                  border: "1px solid rgba(74,222,128,0.25)",
                }}
              >
                <Download size={14} /> Exportar
              </button>
              <label
                style={{
                  ...btnBase,
                  background: "rgba(56,189,248,0.12)",
                  color: C.accent,
                  border: `1px solid ${C.accentBorder}`,
                  cursor: "pointer",
                }}
              >
                <Upload size={14} /> Importar
                <input
                  ref={fileRef}
                  type="file"
                  accept=".json"
                  hidden
                  onChange={handleImport}
                />
              </label>
              <button
                onClick={() => setShowRandom(true)}
                style={{
                  ...btnBase,
                  background: "rgba(249,115,22,0.12)",
                  color: C.orange,
                  border: "1px solid rgba(249,115,22,0.25)",
                  gridColumn: "1 / -1",
                }}
              >
                <Shuffle size={14} /> Árbol Aleatorio
              </button>
              <button
                onClick={handleReset}
                style={{
                  ...btnBase,
                  background: "rgba(248,113,113,0.10)",
                  color: C.red,
                  border: "1px solid rgba(248,113,113,0.20)",
                  gridColumn: "1 / -1",
                }}
              >
                <RotateCcw size={14} /> Limpiar árbol
              </button>
            </div>
          </div>

          <div
            style={{
              background: "rgba(15,23,42,0.8)",
              border: `1px solid ${C.border}`,
              borderRadius: 24,
              padding: 18,
            }}
          >
            <p
              style={{
                margin: "0 0 12px",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                color: C.muted,
              }}
            >
              Recorridos
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {traversalBtns.map(({ type, label, color }) => {
                const active = traversalResult?.type === type;
                return (
                  <div key={type}>
                    <button
                      onClick={() => runTraversal(type)}
                      disabled={!root}
                      style={{
                        ...btnBase,
                        width: "100%",
                        background: active ? `${color}22` : `${color}0e`,
                        color,
                        border: `1px solid ${active ? color : color + "35"}`,
                        opacity: root ? 1 : 0.4,
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        boxShadow: active ? `0 0 12px ${color}25` : "none",
                      }}
                    >
                      <span>{label}</span>
                      <ChevronRight
                        size={15}
                        style={{
                          transform: active ? "rotate(90deg)" : "none",
                          transition: "transform 0.2s",
                        }}
                      />
                    </button>

                    {active && (
                      <div
                        style={{
                          marginTop: 5,
                          padding: "10px 12px",
                          borderRadius: 10,
                          background: `${color}0a`,
                          border: `1px solid ${color}28`,
                          animation: "fadeIn 0.15s ease",
                        }}
                      >
                        <p
                          style={{
                            margin: "0 0 5px",
                            fontSize: 10,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.12em",
                            color,
                          }}
                        >
                          {traversalResult.values.length} nodos
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontFamily: "monospace",
                            fontSize: 11,
                            color: C.white,
                            lineHeight: 1.8,
                            wordBreak: "break-all",
                          }}
                        >
                          {traversalResult.values.join(" → ")}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reconstruir */}
          <div
            style={{
              background: "rgba(15,23,42,0.8)",
              border: `1px solid ${C.border}`,
              borderRadius: 24,
              padding: 18,
            }}
          >
            <p
              style={{
                margin: "0 0 4px",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                color: C.muted,
              }}
            >
              Reconstruir árbol
            </p>
            <p
              style={{
                margin: "0 0 12px",
                fontSize: 11,
                color: C.muted,
                lineHeight: 1.5,
              }}
            >
              Ingresa inorder y postorder (comas o espacios).
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 5,
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#0ea5e9",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Inorder
                </label>
                <input
                  value={inorderInput}
                  onChange={(e) => {
                    setInorderInput(e.target.value);
                    setReconstructErr("");
                    setReconstructOk(false);
                  }}
                  placeholder="4, 2, 5, 1, 3..."
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 10,
                    border: `1px solid ${C.inputBorder}`,
                    background: C.inputBg,
                    color: C.white,
                    fontSize: 13,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 5,
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#f97316",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Postorder
                </label>
                <input
                  value={postorderInput}
                  onChange={(e) => {
                    setPostorderInput(e.target.value);
                    setReconstructErr("");
                    setReconstructOk(false);
                  }}
                  placeholder="4, 5, 2, 3, 1..."
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 10,
                    border: `1px solid ${C.inputBorder}`,
                    background: C.inputBg,
                    color: C.white,
                    fontSize: 13,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {reconstructErr && (
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "flex-start",
                    background: "rgba(248,113,113,0.10)",
                    border: "1px solid rgba(248,113,113,0.25)",
                    borderRadius: 10,
                    padding: "8px 12px",
                  }}
                >
                  <AlertCircle
                    size={14}
                    style={{ color: C.red, flexShrink: 0, marginTop: 1 }}
                  />
                  <p
                    style={{
                      margin: 0,
                      color: C.red,
                      fontSize: 12,
                      lineHeight: 1.4,
                    }}
                  >
                    {reconstructErr}
                  </p>
                </div>
              )}

              {reconstructOk && (
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    background: "rgba(74,222,128,0.10)",
                    border: "1px solid rgba(74,222,128,0.25)",
                    borderRadius: 10,
                    padding: "8px 12px",
                  }}
                >
                  <CheckCircle2 size={14} style={{ color: C.green }} />
                  <p style={{ margin: 0, color: C.green, fontSize: 12 }}>
                    ¡Árbol reconstruido!
                  </p>
                </div>
              )}

              <button
                onClick={handleReconstruct}
                style={{
                  ...btnBase,
                  background: "rgba(129,140,248,0.15)",
                  color: C.indigo,
                  border: "1px solid rgba(129,140,248,0.30)",
                  justifyContent: "center",
                }}
              >
                <GitBranch size={15} /> Reconstruir árbol
              </button>
            </div>
          </div>
        </div>
      </div>

      {showRandom && (
        <RandomModal
          onClose={() => setShowRandom(false)}
          onGenerate={handleGenerate}
        />
      )}

      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
