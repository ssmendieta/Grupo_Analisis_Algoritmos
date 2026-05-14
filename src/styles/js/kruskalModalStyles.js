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
  width: "min(620px, 94vw)",
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
  fontSize: 16,
  marginBottom: 20,
  lineHeight: 1.5,
};

export const cardsWrapStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
};

export const cardMinStyle = {
  background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
  color: "#1e3a5f",
  border: "none",
  borderRadius: 16,
  padding: 20,
  textAlign: "left",
  display: "flex",
  flexDirection: "column",
  gap: 10,
  cursor: "pointer",
  fontWeight: 700,
  transition: "transform 0.12s, box-shadow 0.12s",
};

export const cardMaxStyle = {
  background: "linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)",
  color: "#5b1a38",
  border: "none",
  borderRadius: 16,
  padding: 20,
  textAlign: "left",
  display: "flex",
  flexDirection: "column",
  gap: 10,
  cursor: "pointer",
  fontWeight: 700,
  transition: "transform 0.12s, box-shadow 0.12s",
};

export const cardTitleStyle = {
  fontSize: 22,
  fontWeight: 800,
  marginBottom: 4,
};

export const cardTextStyle = {
  fontSize: 14,
  lineHeight: 1.4,
  opacity: 0.85,
  fontWeight: 400,
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

export const primaryBtnStyle = {
  padding: "10px 22px",
  borderRadius: 10,
  background: "#537a96",
  color: "white",
  border: "none",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 14,
};

export const footerActionsStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  marginTop: 22,
};

export const errorStyle = {
  marginTop: 14,
  color: "#dc2626",
  fontSize: 13,
  background: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: 8,
  padding: "8px 12px",
};

export const iconCircleStyle = {
  width: 110,
  height: 110,
  borderRadius: "50%",
  border: "3px solid #86efac",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto",
};

export const resultTitleStyle = {
  textAlign: "center",
  fontSize: 28,
  fontWeight: 300,
  margin: "12px 0 6px",
  letterSpacing: "-0.5px",
};

export const resultSubStyle = {
  textAlign: "center",
  color: "#4b5563",
  fontSize: 16,
  margin: "4px 0 0",
};

export const weightStyle = {
  textAlign: "center",
  fontSize: 20,
  fontWeight: 700,
  color: "#1f2937",
  margin: "8px 0 0",
};

export const badgeStyle = (isMin) => ({
  display: "inline-block",
  padding: "3px 12px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  background: isMin ? "#dbeafe" : "#fce7f3",
  color: isMin ? "#1e40af" : "#9d174d",
  marginBottom: 8,
});
