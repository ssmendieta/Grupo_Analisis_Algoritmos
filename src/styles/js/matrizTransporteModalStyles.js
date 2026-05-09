function numberValue(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export function cellHeatStyle(allocation) {
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

export function tableHeadStyle(isCorner = false) {
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

export function tableRowHeaderStyle() {
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

export function tableCellStyle() {
  return {
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "14px 10px",
    textAlign: "center",
    color: "#edf6ff",
    fontSize: 16,
  };
}

export function infoChipStyle() {
  return {
    borderRadius: 12,
    background: "rgba(255,255,255,0.06)",
    padding: "10px 14px",
    color: "#d7e7f8",
    fontSize: 14,
  };
}

export function navButtonStyle(disabled) {
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
