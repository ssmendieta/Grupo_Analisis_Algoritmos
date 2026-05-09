export const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.78)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10050,
  padding: 16,
  backdropFilter: "blur(6px)",
};
export const modalStyle = {
  width: "min(920px, 100%)",
  maxHeight: "min(88vh, 900px)",
  overflow: "auto",
  background: "#0d1117",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 18,
  padding: 22,
  color: "#e2e8f0",
  boxShadow: "0 32px 80px rgba(0,0,0,0.85)",
};
export const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 14,
  paddingBottom: 14,
  borderBottom: "1px solid rgba(255,255,255,0.06)",
};
export const closeBtnStyle = {
  background: "transparent",
  border: "none",
  color: "#64748b",
  cursor: "pointer",
  padding: 4,
};
export const summaryRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 16,
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid",
  background: "rgba(255,255,255,0.03)",
};
export const tableScroll = {
  overflowX: "auto",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.06)",
  padding: 10,
  background: "#070a10",
};
export const thCorner = {
  padding: "8px 10px",
  fontSize: 10,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  textAlign: "left",
  verticalAlign: "bottom",
};
export const th = {
  padding: "8px 10px",
  fontSize: 12,
  fontWeight: 800,
  textAlign: "center",
  minWidth: 56,
};
export const thRow = {
  padding: "8px 12px",
  fontSize: 12,
  fontWeight: 800,
  whiteSpace: "nowrap",
};
export const td = {
  padding: "10px 12px",
  textAlign: "center",
  fontSize: 14,
  fontFamily: "ui-monospace, monospace",
  borderRadius: 8,
  minWidth: 52,
};
export const primaryBtn = {
  padding: "9px 22px",
  borderRadius: 9,
  background: "linear-gradient(135deg, #1d4ed8, #7c3aed)",
  color: "#fff",
  border: "none",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 13,
};
