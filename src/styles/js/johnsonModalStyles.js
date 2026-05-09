export const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.65)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
  backdropFilter: "blur(4px)",
};

export const modalStyle = {
  width: "min(760px, 94vw)",
  background: "#ffffff",
  border: "1px solid rgba(0,0,0,0.08)",
  borderRadius: "18px",
  padding: "28px",
  color: "#1f2937",
  boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
};

export const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 12,
};

export const closeBtnStyle = {
  background: "transparent",
  border: "none",
  color: "#64748b",
  cursor: "pointer",
};

export const subtitleStyle = {
  color: "#6b7280",
  fontSize: 18,
  marginBottom: 20,
  lineHeight: 1.4,
};

export const cardsWrapStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
};

export const cardBtnStyle = {
  background: "#bfe9f7",
  color: "#111827",
  border: "none",
  borderRadius: 16,
  padding: 20,
  textAlign: "left",
  display: "flex",
  gap: 14,
  cursor: "pointer",
  fontWeight: 700,
};

export const cardTitleStyle = {
  fontSize: 22,
  fontWeight: 800,
  marginBottom: 8,
};

export const cardTextStyle = {
  fontSize: 16,
  lineHeight: 1.3,
  opacity: 0.9,
};

export const secondaryBtnStyle = {
  padding: "10px 18px",
  borderRadius: 10,
  background: "#e5e7eb",
  color: "#374151",
  border: "1px solid #d1d5db",
  cursor: "pointer",
  fontWeight: 700,
};

export const primaryBtnStyle = {
  padding: "10px 18px",
  borderRadius: 10,
  background: "#537a96",
  color: "white",
  border: "none",
  cursor: "pointer",
  fontWeight: 700,
};

export const footerActionsStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  marginTop: 22,
};

export const labelStyle = {
  display: "block",
  marginBottom: 8,
  fontSize: 16,
  color: "#6b7280",
};

export const selectStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 8,
  background: "#ffffff",
  color: "#111827",
  border: "1px solid #d1d5db",
  outline: "none",
  fontSize: 16,
};

export const errorStyle = {
  marginTop: 14,
  color: "#dc2626",
  fontSize: 14,
};

export const iconCircleStyle = {
  width: 110,
  height: 110,
  borderRadius: "50%",
  border: "3px solid #67e8f9",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto",
};

export const resultTitleStyle = {
  textAlign: "center",
  fontSize: 42,
  fontWeight: 300,
  margin: "10px 0 6px",
};

export const resultSubStyle = {
  textAlign: "center",
  color: "#4b5563",
  fontSize: 22,
  margin: 0,
};

export const distanceStyle = {
  textAlign: "center",
  color: "#6b7280",
  fontSize: 20,
  marginTop: 8,
};
