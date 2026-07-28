import { useState, useEffect, createContext, useContext } from "react";
import { apiFetch } from "./api.js";

// ===========================================================
// AUTH CONTEXT
// =========================================================

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const storedUser  = localStorage.getItem("umkm_user");
      const storedToken = localStorage.getItem("umkm_token");

      if (storedUser && storedToken) {
        // Token "local" adalah sisa mock lama (pre-Sanctum) — tidak perlu
        // divalidasi ke server, langsung percaya cache seperti sebelumnya.
        if (storedToken === "local") {
          try { setUser(JSON.parse(storedUser)); } catch { /* invalid JSON */ }
          setAuthLoading(false);
          return;
        }

        // FIX: validasi token ke backend (GET /auth/me) sebelum mempercayai
        // cache lokal. Sebelumnya, app langsung setUser() dari localStorage
        // tanpa cek apakah token itu masih valid di server — akibatnya:
        //   1) Restart dev server / restart browser lama bisa "auto-login"
        //      pakai token basi (misal setelah migrate:fresh di backend),
        //      dan app lompat ke Dashboard alih-alih Login.
        //   2) Kalau token sudah di-revoke tapi belum expired secara UI,
        //      user tetap melihat data cache lama tanpa disadari sesinya
        //      sebenarnya sudah tidak sah di server.
        try {
          const data = await apiFetch("/auth/me");
          setUser(data.user);
          // Sinkronkan cache lokal dengan data terbaru dari server
          localStorage.setItem("umkm_user", JSON.stringify(data.user));
        } catch {
          // Token invalid/expired di server — bersihkan cache lokal sepenuhnya,
          // App.jsx akan otomatis redirect ke halaman Login.
          localStorage.removeItem("umkm_user");
          localStorage.removeItem("umkm_token");
          setUser(null);
        }
      }

      setAuthLoading(false);
    })();
  }, []);

  // login sekarang terima userData + token (siap untuk Sanctum)
  const login = (userData, token = "local") => {
    setUser(userData);
    localStorage.setItem("umkm_user",  JSON.stringify(userData));
    localStorage.setItem("umkm_token", token);
  };

  const logout = async () => {
    try {
      // Hanya panggil API kalau token-nya bukan token mock lama ("local")
      if (localStorage.getItem("umkm_token") && localStorage.getItem("umkm_token") !== "local") {
        await apiFetch("/auth/logout", { method: "POST" });
      }
    } catch {
      // Token sudah invalid/expired di server — tidak masalah, lanjut hapus lokal saja
    }
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
