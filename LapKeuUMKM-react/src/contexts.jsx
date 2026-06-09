import { useState, useEffect, createContext, useContext } from "react";

// ===========================================================
// AUTH CONTEXT
// =========================================================

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]             = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const storedUser  = localStorage.getItem("umkm_user");
    const storedToken = localStorage.getItem("umkm_token");
    if (storedUser && storedToken) {
      try { setUser(JSON.parse(storedUser)); } catch { /* invalid JSON */ }
    }
    setAuthLoading(false);
  }, []);

  // login sekarang terima userData + token (siap untuk Sanctum)
  const login = (userData, token = "local") => {
    setUser(userData);
    localStorage.setItem("umkm_user",  JSON.stringify(userData));
    localStorage.setItem("umkm_token", token);
  };

  const logout = async () => {
    // TODO B.2: await apiFetch("/auth/logout", { method: "POST" });
    setUser(null);
    localStorage.removeItem("umkm_user");
    localStorage.removeItem("umkm_token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// =========================================================
// NOTIF CONTEXT
// =========================================================

export const NotifContext = createContext(null);

const notifStyles = {
  wrapper: {
    position: "fixed", top: 20, right: 20, zIndex: 999,
  },
  notif: {
    background: "#fff", borderRadius: 10, padding: "12px 18px",
    boxShadow: "0 8px 24px rgba(0,0,0,.12)",
    display: "flex", alignItems: "center",
    fontSize: 14, fontWeight: 500, color: "#111827",
    animation: "slideIn .2s ease",
    minWidth: 240,
  },
};

export function NotifProvider({ children }) {
  const [notif, setNotif] = useState(null);

  const showNotif = (message, type = "success") => {
    setNotif({ message, type });
    setTimeout(() => setNotif(null), 3000);
  };

  return (
    <NotifContext.Provider value={{ notif, showNotif }}>
      {children}
      {notif && (
        <div style={notifStyles.wrapper}>
          <div style={{
            ...notifStyles.notif,
            backgroundColor: notif.type === "success" ? "#fff" : "#fff3f3",
            borderLeft: `4px solid ${notif.type === "success" ? "#22c55e" : "#ef4444"}`,
          }}>
            <span style={{ fontSize: 14, marginRight: 8 }}>
              {notif.type === "success" ? "✅" : "❌"}
            </span>
            {notif.message}
          </div>
        </div>
      )}
    </NotifContext.Provider>
  );
}

export function useNotif() {
  return useContext(NotifContext);
}