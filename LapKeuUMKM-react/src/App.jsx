import { useState, useEffect } from "react";
import { AuthProvider, NotifProvider, useAuth } from "./contexts.jsx";
import { SidebarLayout, LogoIcon } from "./components.jsx";

// Pages
import DashboardPage    from "./pages/DashboardPage.jsx";
import PurchasesPage    from "./pages/PurchasesPage.jsx";
import SalesPage        from "./pages/SalesPage.jsx";
import CashFlowPage     from "./pages/CashFlowPage.jsx";
import InventoryPage    from "./pages/InventoryPage.jsx";
import SuppliersPage    from "./pages/SuppliersPage.jsx";
import ReportsPage      from "./pages/ReportsPage.jsx";
import ActivityLogPage  from "./pages/ActivityLogPage.jsx";
import PanduanPage      from "./pages/PanduanPage.jsx";
import ProfilePage      from "./pages/ProfilePage.jsx";
import LoginPage        from "./pages/LoginPage.jsx";
import RegisterPage     from "./pages/RegisterPage.jsx";

// ── Route constants ──────────────────────────────────────────
const ROUTES = {
  LOGIN:        "/login",
  REGISTER:     "/register",
  DASHBOARD:    "/dashboard",
  PURCHASES:    "/purchases",
  SALES:        "/sales",
  CASHFLOW:     "/cashflow",
  INVENTORY:    "/inventory",
  SUPPLIERS:    "/suppliers",
  REPORTS:      "/reports",
  ACTIVITY_LOG: "/activity-log",
  PANDUAN:      "/panduan",
  PROFILE:      "/profile",
};

// ── Hash-based router ────────────────────────────────────────
function useHashRouter() {
  const getPath = () => {
    const hash = window.location.hash.replace("#", "") || ROUTES.LOGIN;
    return hash.split("?")[0];
  };
  const [currentPath, setCurrentPath] = useState(getPath);

  useEffect(() => {
    const handler = () => setCurrentPath(getPath());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const navigate = (path) => { window.location.hash = path; };
  return { currentPath, navigate };
}

// ── Page renderer ────────────────────────────────────────────
function renderPage(path, navigate) {
  switch (path) {
    case ROUTES.DASHBOARD:    return <DashboardPage />;
    case ROUTES.PURCHASES:    return <PurchasesPage />;
    case ROUTES.SALES:        return <SalesPage />;
    case ROUTES.CASHFLOW:     return <CashFlowPage />;
    case ROUTES.INVENTORY:    return <InventoryPage />;
    case ROUTES.SUPPLIERS:    return <SuppliersPage />;
    case ROUTES.REPORTS:      return <ReportsPage />;
    case ROUTES.ACTIVITY_LOG: return <ActivityLogPage />;
    case ROUTES.PANDUAN:      return <PanduanPage />;
    case ROUTES.PROFILE:      return <ProfilePage />;
    default: return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <p style={{ fontSize: 48 }}>🔍</p>
        <h2 style={{ fontSize: 22, marginBottom: 8 }}>Halaman tidak ditemukan</h2>
        <p style={{ color: "#6b7280", marginBottom: 20 }}>Path yang kamu akses tidak tersedia.</p>
        <button onClick={() => navigate(ROUTES.DASHBOARD)}
          style={{ background: "#4F46E5", color: "#fff", border: "none", padding: "9px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
          Kembali ke Dashboard
        </button>
      </div>
    );
  }
}

// ── Inner app (pakai context) ────────────────────────────────
function AppInner() {
  const { user, authLoading } = useAuth();
  const { currentPath, navigate } = useHashRouter();

  useEffect(() => {
    if (authLoading) return;
    const isAuthPage = currentPath === ROUTES.LOGIN || currentPath === ROUTES.REGISTER;
    if (!user && !isAuthPage)               navigate(ROUTES.LOGIN);
    if (user && (isAuthPage || currentPath === "/")) navigate(ROUTES.DASHBOARD);
  }, [user, authLoading, currentPath]);

  if (authLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <div style={{ textAlign: "center" }}>
          <LogoIcon />
          <p style={{ marginTop: 12, color: "#6b7280", fontSize: 14 }}>Memuat aplikasi…</p>
        </div>
      </div>
    );
  }

  if (currentPath === ROUTES.LOGIN)    return <LoginPage    navigate={navigate} />;
  if (currentPath === ROUTES.REGISTER) return <RegisterPage navigate={navigate} />;
  if (!user) return null;

  return (
    <SidebarLayout currentPath={currentPath} navigate={navigate}>
      {renderPage(currentPath, navigate)}
    </SidebarLayout>
  );
}

// ── Root export ──────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <NotifProvider>
        <AppInner />
      </NotifProvider>
    </AuthProvider>
  );
}