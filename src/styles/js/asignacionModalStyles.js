export const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.75)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
  backdropFilter: "blur(6px)",
};
export const modalStyle = {
  width: "min(660px, 94vw)",
  background: "#0d1117",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 20,
  padding: 24,
  color: "#e2e8f0",
  boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
  maxHeight: "90vh",
  overflowY: "auto",
};
export const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 18,
  paddingBottom: 16,
  borderBottom: "1px solid rgba(255,255,255,0.06)",
};
export const headerIconStyle = {
  width: 36,
  height: 36,
  borderRadius: 9,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};
export const closeBtnStyle = {
  background: "transparent",
  border: "none",
  color: "#475569",
  cursor: "pointer",
  padding: 4,
};
export const summaryBar = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 18,
  flexWrap: "wrap",
};
export const warningChip = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 12px",
  borderRadius: 8,
  background: "rgba(245,158,11,0.08)",
  border: "1px solid rgba(245,158,11,0.25)",
};
export const subtitleStyle = {
  color: "#475569",
  fontSize: 13,
  marginBottom: 16,
  lineHeight: 1.5,
};
export const cardsGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
  marginBottom: 4,
};
export const errorBox = {
  marginTop: 12,
  padding: "10px 14px",
  background: "rgba(239,68,68,0.1)",
  border: "1px solid rgba(239,68,68,0.3)",
  borderRadius: 8,
  color: "#f87171",
  fontSize: 12,
};
export const footer = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  marginTop: 16,
};
export const secondaryBtn = {
  padding: "9px 18px",
  borderRadius: 9,
  background: "rgba(255,255,255,0.05)",
  color: "#94a3b8",
  border: "1px solid rgba(255,255,255,0.08)",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 13,
};
export const primaryBtn = {
  padding: "9px 20px",
  borderRadius: 9,
  color: "white",
  border: "none",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 13,
};
export const resultHeader = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "12px 16px",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 12,
  marginBottom: 12,
};
export const resultIconCircle = {
  width: 38,
  height: 38,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};
export const multiSolBanner = {
  padding: "12px 16px",
  background: "rgba(245,158,11,0.06)",
  border: "1px solid rgba(245,158,11,0.2)",
  borderRadius: 12,
  marginBottom: 12,
};
export const multiSolHeader = { display: "flex", alignItems: "center", gap: 8 };
export const altButtonsRow = { display: "flex", gap: 6, flexWrap: "wrap" };
export const altBtn = {
  padding: "5px 12px",
  borderRadius: 7,
  fontSize: 12,
  cursor: "pointer",
  transition: "all 0.15s",
};
export const warningBox = {
  display: "flex",
  alignItems: "flex-start",
  gap: 8,
  padding: "9px 14px",
  background: "rgba(245,158,11,0.07)",
  border: "1px solid rgba(245,158,11,0.2)",
  borderRadius: 8,
  marginBottom: 12,
};
export const tableWrap = {
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 10,
  overflow: "hidden",
  marginBottom: 4,
};
export const th = {
  padding: "9px 14px",
  textAlign: "left",
  fontSize: 10,
  fontWeight: 700,
  color: "#475569",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  background: "rgba(255,255,255,0.03)",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
};
export const td = {
  padding: "9px 14px",
  fontSize: 13,
  color: "#e2e8f0",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
};
