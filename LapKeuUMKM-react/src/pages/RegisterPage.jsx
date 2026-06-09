import { useState } from "react";
import { useAuth } from "../contexts.jsx";
import { useNotif } from "../contexts.jsx";
import { LogoIcon, Btn, Field } from "../components.jsx";
import styles from "../styles.js";
// import { apiFetch } from "../api.js"; // TODO B.4

const ROUTES = { DASHBOARD: "/dashboard", LOGIN: "/login" };

export default function RegisterPage({ navigate }) {
  const { login }     = useAuth();
  const { showNotif } = useNotif();
  const [form, setForm]   = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) { showNotif("Semua field wajib diisi", "error"); return; }
    if (form.password !== form.confirm) { showNotif("Password tidak cocok", "error"); return; }
    if (form.password.length < 6) { showNotif("Password minimal 6 karakter", "error"); return; }
    setLoading(true);
    try {
      // TODO B.4: uncomment baris di bawah dan hapus simulasi
      // const data = await apiFetch("/auth/register", { method: "POST", body: JSON.stringify({ name: form.name, email: form.email, password: form.password, password_confirmation: form.confirm }) });
      // login(data.user, data.token);
      await new Promise(r => setTimeout(r, 400));
      login({ name: form.name, email: form.email }, "local");
      showNotif("Akun berhasil dibuat!");
      navigate(ROUTES.DASHBOARD);
    } catch (e) {
      showNotif(e.message, "error");
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
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>Create Your Account</h2>
          <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>Start managing your finances in minutes</p>
        </div>

        <Field label="Full Name"            value={form.name}     onChange={set("name")}     placeholder="John Doe"              required />
        <Field label="Email Address" type="email" value={form.email} onChange={set("email")} placeholder="your.email@example.com" required />
        <Field label="Password"      type="password" value={form.password} onChange={set("password")} placeholder="At least 6 characters" required />
        <Field label="Confirm Password" type="password" value={form.confirm} onChange={set("confirm")} placeholder="Repeat your password" required />

        <Btn onClick={handleSubmit} disabled={loading}>
          {loading ? "Creating…" : "Create Account"}
        </Btn>

        <p style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: "#9ca3af" }}>
          By signing up, you agree to our{" "}
          <span style={{ color: "#4F46E5", cursor: "pointer" }}>Terms of Service</span>
          {" "}and{" "}
          <span style={{ color: "#4F46E5", cursor: "pointer" }}>Privacy Policy</span>
        </p>
        <p style={{ textAlign: "center", fontSize: 13, color: "#6b7280" }}>
          Already have an account?{" "}
          <button onClick={() => navigate(ROUTES.LOGIN)}
            style={{ color: "#4F46E5", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
            Login here
          </button>
        </p>
      </div>
    </div>
  );
}