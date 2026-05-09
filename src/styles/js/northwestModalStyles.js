export function cellHeatStyle(cost, allocation) {
  const hasAllocation = Number(allocation || 0) > 0;
  if (!hasAllocation) {
    return {
      background: "rgba(8, 15, 35, 0.92)",
      boxShadow: "inset 0 0 0 1px rgba(148,163,184,0.12)",
    };
  }

  const intensity = Math.min(1, 0.25 + Number(allocation || 0) / 80);
  return {
    background: `linear-gradient(135deg, rgba(96,165,250,${0.34 + intensity * 0.2}), rgba(34,197,94,${0.08 + intensity * 0.08}))`,
    boxShadow: "inset 0 0 0 1px rgba(96,165,250,0.22)",
  };
}

export function toolbarButtonStyle(variant = "soft") {
  const map = {
    add: {
      background: "linear-gradient(135deg, #7286ff, #8b5cf6)",
      border: "1px solid rgba(191,219,254,0.14)",
      color: "#f8fbff",
    },
    remove: {
      background:
        "linear-gradient(135deg, rgba(37,99,235,0.28), rgba(59,130,246,0.18))",
      border: "1px solid rgba(255,255,255,0.12)",
      color: "#fff7fb",
    },
    solve: {
      background: "linear-gradient(135deg, #38bdf8, #22d3ee)",
      border: "1px solid rgba(255,255,255,0.12)",
      color: "#f8fbff",
    },
    neutral: {
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.14)",
      color: "#dbeafe",
    },
  };

  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 20px",
    borderRadius: 14,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 8px 22px rgba(0,0,0,0.12)",
    ...map[variant],
  };
}

export function statCardStyle(accent) {
  return {
    borderRadius: 18,
    padding: "16px 18px",
    background: "rgba(11, 19, 39, 0.82)",
    border: `1px solid ${accent}`,
    boxShadow: "0 12px 26px rgba(0,0,0,0.18)",
  };
}

export function sectionCardStyle() {
  return {
    borderRadius: 26,
    padding: 22,
    background:
      "linear-gradient(180deg, rgba(22,30,62,0.8), rgba(17,24,50,0.82))",
    border: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 20px 54px rgba(0,0,0,0.18)",
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

export function editorInputStyle(variant = "cell") {
  const isHeader = variant === "header";
  const isSupply = variant === "supply";
  const disabled = variant === "disabled";

  return {
    width: "100%",
    minWidth: isHeader ? 120 : 88,
    borderRadius: 10,
    outline: "none",
    border: disabled
      ? "1px dashed rgba(148,163,184,0.22)"
      : isSupply
        ? "1px solid rgba(250,204,21,0.32)"
        : "1px solid rgba(148,163,184,0.14)",
    background: disabled
      ? "rgba(30,41,59,0.48)"
      : isHeader
        ? "rgba(18, 28, 54, 0.82)"
        : isSupply
          ? "rgba(25, 37, 67, 0.92)"
          : "rgba(15, 23, 42, 0.82)",
    color: disabled ? "#94a3b8" : isSupply ? "#f8fafc" : "#edf6ff",
    padding: "10px 12px",
    textAlign: "center",
    fontSize: 15,
    boxSizing: "border-box",
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

export function stepBadgeStyle() {
  return {
    borderRadius: 14,
    padding: "12px 18px",
    background: "rgba(67,82,124,0.56)",
    color: "#f8fbff",
    fontSize: 15,
    fontWeight: 500,
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
