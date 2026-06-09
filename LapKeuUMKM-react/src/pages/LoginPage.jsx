import { useState } from "react";
import { useAuth } from "../contexts.jsx";
import { useNotif } from "../contexts.jsx";
import { LogoIcon, Btn, Field } from "../components.jsx";
import styles from "../styles.js";
// import { apiFetch } from "../api.js"; // TODO B.4

const ROUTES = { DASHBOARD: "/dashboard", REGISTER: "/register" };

export default function LoginPage({ navigate }) {
  const { login }     = useAuth();
  const { showNotif } = useNotif();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) { showNotif("Email dan password wajib diisi", "error"); return; }
    setLoading(true);
    try {
      // TODO B.4: uncomment baris di bawah dan hapus simulasi
      // const data = await apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      // login(data.user, data.token);
      await new Promise(r => setTimeout(r, 400));
      login({ name: "User UMKM", email }, "local");
      showNotif("Login berhasil!");
      navigate(ROUTES.DASHBOARD);
    } catch (e) {
      showNotif(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setLoading(true);
    try {
      // TODO B.4: uncomment baris di bawah dan hapus simulasi
      // const data = await apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ email: "test@example.com", password: "password" }) });
      // login(data.user, data.token);
      await new Promise(r => setTimeout(r, 300));
      login({ name: "Demo User", email: "demo@umkm.id" }, "local");
      navigate(ROUTES.DASHBOARD);
    } catch {
      login({ name: "Demo User", email: "demo@umkm.id" }, "local");
      navigate(ROUTES.DASHBOARD);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.authBg}>
      <div style={styles.authCard}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}>
            <LogoIcon />
            <span style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>UMKM Finance</span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>Welcome Back</h2>
          <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>Login to access your dashboard</p>
        </div>

        <Field label="Email Address" type="email" value={email}
          onChange={e => setEmail(e.target.value)} placeholder="your.email@example.com" required />
        <div style={{ position: "relative", marginBottom: 20 }}>
          <Field label="Password" type="password" value={password}
            onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required />
          <button style={styles.forgotBtn}>Forgot password?</button>
        </div>

        <Btn onClick={handleSubmit} disabled={loading}>
          {loading ? "Loading…" : "Login to Dashboard"}
        </Btn>
        <div style={{ textAlign: "center", margin: "16px 0", color: "#9ca3af", fontSize: 13 }}>or</div>
        <Btn variant="outline" onClick={handleDemo} disabled={loading}>
          Try Demo Account
        </Btn>

        <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#6b7280" }}>
          Don't have an account?{" "}
          <button onClick={() => navigate(ROUTES.REGISTER)}
            style={{ color: "#4F46E5", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
            Sign up for free
          </button>
        </p>
      </div>
    </div>
  );
}