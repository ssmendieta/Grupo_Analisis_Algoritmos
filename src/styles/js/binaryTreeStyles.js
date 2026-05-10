export const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.70)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
  backdropFilter: "blur(6px)",
};

export const modalStyle = {
  width: "min(480px, 94vw)",
  background: "#ffffff",
  border: "1px solid rgba(0,0,0,0.08)",
  borderRadius: "20px",
  padding: "28px",
  color: "#1f2937",
  boxShadow: "0 24px 80px rgba(0,0,0,0.28)",
};

export const modalHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 18,
};

export const closeBtnStyle = {
  background: "transparent",
  border: "none",
  color: "#64748b",
  cursor: "pointer",
  padding: 4,
};

export const labelStyle = {
  display: "block",
  marginBottom: 6,
  fontSize: 13,
  fontWeight: 600,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

export const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  fontSize: 15,
  color: "#111827",
  outline: "none",
  boxSizing: "border-box",
};

export const rowStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
};

export const primaryBtnStyle = {
  padding: "11px 20px",
  borderRadius: 10,
  background: "#0ea5e9",
  color: "white",
  border: "none",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 14,
  width: "100%",
  marginTop: 18,
};

export const secondaryBtnStyle = {
  padding: "10px 18px",
  borderRadius: 10,
  background: "#e5e7eb",
  color: "#374151",
  border: "1px solid #d1d5db",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 14,
};

export const errorStyle = {
  marginTop: 12,
  color: "#dc2626",
  fontSize: 13,
  lineHeight: 1.4,
};

export const traversalPanelStyle = {
  background: "white",
  borderRadius: 28,
  padding: 24,
  display: "flex",
  flexDirection: "column",
  gap: 14,
  boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
  minWidth: 280,
};
