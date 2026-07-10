const styles = {
  // Auth
  authBg: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #3b4fd8 0%, #6d28d9 60%, #7c3aed 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 20,
  },
  authCard: {
    background: "#fff", borderRadius: 16, padding: "36px 32px",
    width: "100%", maxWidth: 420,
    boxShadow: "0 20px 60px rgba(0,0,0,.18)",
    display: "flex", flexDirection: "column",
  },
  forgotBtn: {
    position: "absolute", right: 0, top: 0,
    background: "none", border: "none", color: "#4F46E5",
    fontSize: 13, cursor: "pointer", fontWeight: 500,
  },

  // Shell
  appShell:  { display: "flex", minHeight: "100vh", background: "#f3f4f6" },
  sidebar: {
    width: 180, minWidth: 180, background: "#fff",
    borderRight: "1px solid #e5e7eb",
    display: "flex", flexDirection: "column",
    padding: "0 0 16px",
    position: "sticky", top: 0, height: "100vh", overflowY: "auto",
  },
  sidebarLogo: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "18px 16px 14px",
    borderBottom: "1px solid #f3f4f6",
    marginBottom: 8,
  },
  navItem: {
    display: "flex", alignItems: "center", gap: 10,
    width: "100%", padding: "8px 14px",
    background: "none", border: "none", textAlign: "left",
    fontSize: 13, color: "#374151", cursor: "pointer",
    borderRadius: 999, transition: "background .15s",
  }, // Note 13: edit sikit
  navItemActive: { background: "#ede9fe", color: "#4F46E5", fontWeight: 600 },
  mainArea:    { flex: 1, display: "flex", flexDirection: "column", minWidth: 0 },
  topbar: {
    height: 52, background: "#fff", borderBottom: "1px solid #e5e7eb",
    display: "flex", alignItems: "center", padding: "0 20px",
    position: "sticky", top: 0, zIndex: 10,
  },
  userBadge:  { display: "flex", alignItems: "center", gap: 8 },
  userAvatar: {
    width: 34, height: 34, borderRadius: "50%",
    background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer",
  },
  pageContent: { padding: 20, flex: 1 },

  // Cards
  card: {
    background: "#fff", borderRadius: 12,
    padding: "20px 20px", marginBottom: 16,
    boxShadow: "0 1px 4px rgba(0,0,0,.06)",
  },
  cardTitle: { fontSize: 15, fontWeight: 700, margin: "0 0 2px", color: "#111827" },
  cardSub:   { fontSize: 12, color: "#9ca3af", margin: "0 0 12px" },
  pageTitle: { fontSize: 20, fontWeight: 700, margin: "0 0 16px", color: "#111827" },
  statsRow:  { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 },
  statCard: {
    background: "#fff", borderRadius: 12, padding: "16px 18px",
    boxShadow: "0 1px 4px rgba(0,0,0,.06)",
  },
  statCardAccent: {
    background: "linear-gradient(135deg, #4F46E5, #7c3aed)",
    color: "#fff",
  },
  statLabel: { fontSize: 11, fontWeight: 600, letterSpacing: ".06em", marginBottom: 6, textTransform: "uppercase" },
  statValue: { fontSize: 22, fontWeight: 700, margin: "0 0 4px" },
  statSub:   { fontSize: 12, margin: 0 },

  // Table
  table:   { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th:      { padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: ".06em", borderBottom: "1px solid #e5e7eb", textTransform: "uppercase" },
  td:      { padding: "10px 12px", color: "#374151", borderBottom: "1px solid #f3f4f6" },
  tdEmpty: { padding: "32px", textAlign: "center", color: "#9ca3af", fontSize: 13 },

  // Modal
  modalBackdrop: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,.45)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 100, padding: 20,
  },
  modalCard:   { background: "#fff", borderRadius: 14, width: "100%", maxWidth: 400, boxShadow: "0 24px 60px rgba(0,0,0,.18)" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px 0" },
  modalTitle:  { fontSize: 16, fontWeight: 700, margin: 0 },
  modalClose:  { background: "none", border: "none", fontSize: 16, cursor: "pointer", color: "#9ca3af" },
  modalBody:   { padding: "16px 20px 20px" },

  // Form
  fieldLabel: { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5 },
  input: {
    width: "100%", padding: "8px 12px", borderRadius: 8,
    border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none",
    boxSizing: "border-box", background: "#fff", transition: "border .15s, box-shadow .15s",
  },

  // Tabs
  tabBar:       { display: "flex", gap: 4, marginBottom: 16, borderBottom: "2px solid #e5e7eb" },
  tabBtn:       { background: "none", border: "none", padding: "8px 16px", fontSize: 14, cursor: "pointer", color: "#6b7280", fontWeight: 500, borderBottom: "2px solid transparent", marginBottom: -2 },
  tabBtnActive: { color: "#4F46E5", fontWeight: 700, borderBottomColor: "#4F46E5" },

  // Panduan
  panduanSection: { background: "#f9fafb", borderRadius: 10, padding: "16px 18px" },

  // Notification (dipakai di contexts.jsx)
  notifWrapper: { position: "fixed", top: 20, right: 20, zIndex: 999 },
  notif: {
    background: "#fff", borderRadius: 10, padding: "12px 18px",
    boxShadow: "0 8px 24px rgba(0,0,0,.12)",
    display: "flex", alignItems: "center",
    fontSize: 14, fontWeight: 500, color: "#111827",
    animation: "slideIn .2s ease",
    minWidth: 240,
  },
};

export default styles;