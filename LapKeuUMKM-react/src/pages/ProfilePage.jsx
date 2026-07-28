import { useState, useEffect, useRef } from "react";
import { Btn, Field } from "../components.jsx";
import { useAuth, useNotif } from "../contexts.jsx";
import { apiFetch, apiFetchForm } from "../api.js";
import styles from "../styles.js";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES    = ["image/jpeg", "image/jpg", "image/png"];

export default function ProfilePage() {
  // Catatan 3: tambah `logout` dari useAuth
  const { user, login, logout } = useAuth();
  const { showNotif }           = useNotif();
  const fileInputRef            = useRef(null);

  const [initial, setInitial]           = useState(null);
  const [form, setForm]                 = useState({ name: "", business_name: "", email: "" });
  const [avatarFile, setAvatarFile]     = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [loggingOut, setLoggingOut]     = useState(false); // Catatan 3

  // Muat data profile dari API
  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch("/profile");
        const snapshot = {
          name:          data.user.name          ?? "",
          business_name: data.user.business_name ?? "",
          email:         data.user.email         ?? "",
        };
        setForm(snapshot);
        setInitial({ ...snapshot, avatar_url: data.user.avatar_url ?? null });
      } catch (e) {
        showNotif(e.message ?? "Gagal memuat profile", "error");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handlePickPhoto = () => fileInputRef.current?.click();

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      showNotif("Format file harus JPG atau PNG", "error");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      showNotif("Ukuran file maksimal 2MB", "error");
      e.target.value = "";
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleReset = () => {
    if (!initial) return;
    setForm({ name: initial.name, business_name: initial.business_name, email: initial.email });
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (!form.name || !form.business_name || !form.email) {
      showNotif("Full Name, Business Name, dan Email wajib diisi", "error");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name",          form.name);
      fd.append("business_name", form.business_name);
      fd.append("email",         form.email);
      if (avatarFile) fd.append("avatar", avatarFile);

      const data = await apiFetchForm("/profile", fd);
      login(data.user, localStorage.getItem("umkm_token"));

      const snapshot = {
        name: data.user.name, business_name: data.user.business_name, email: data.user.email,
      };
      setForm(snapshot);
      setInitial({ ...snapshot, avatar_url: data.user.avatar_url ?? null });
      setAvatarFile(null);
      setAvatarPreview(null);
      showNotif("Profile berhasil disimpan");
    } catch (e) {
      showNotif(e.message ?? "Gagal menyimpan profile", "error");
    } finally {
      setSaving(false);
    }
  };

  // Catatan 3: handler logout dari Profile Page
  // App.jsx otomatis redirect ke /login saat user menjadi null
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch {
      showNotif("Gagal logout, coba lagi", "error");
      setLoggingOut(false);
    }
  };

  if (loading) {
    return <p style={{ color: "#9ca3af", fontSize: 14 }}>Memuat profile…</p>;
  }

  const currentPhoto = avatarPreview || initial?.avatar_url;

return (
    <div style={{ 
      width: "100%", 
      maxWidth: "768px", // Diperlebar agar tidak terlalu sempit, tapi tidak terlalu lebar untuk form
      margin: "40px auto", // Memusatkan card di tengah layar dengan jarak atas
      fontFamily: "'Inter', 'Segoe UI', sans-serif", // Font minimalis dan modern
      color: "#111827"
    }}>

      {/* ── Card 1: Profile Settings ──────────────────────── */}
      <div style={{
        ...styles.card,
        padding: "32px", // Menambah ruang napas (padding) di dalam card
        borderRadius: "12px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)" // Shadow yang lebih soft
      }}>
        <h3 style={{ 
          ...styles.cardTitle, 
          fontSize: 20, 
          fontWeight: 600, 
          marginBottom: 28,
          borderBottom: "1px solid #f3f4f6", // Garis pemisah halus
          paddingBottom: "12px"
        }}>
          Profile Settings
        </h3>

        {/* Profile Picture */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32 }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%", background: "#4F46E5",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden", flexShrink: 0,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            {currentPhoto
              ? <img src={currentPhoto} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span style={{ color: "#fff", fontSize: 28 }}>👤</span>
            }
          </div>
          <div>
            <Btn variant="outline" size="sm" onClick={handlePickPhoto} style={{ borderRadius: "6px" }}>
              Change Photo
            </Btn>
            <input
              ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png"
              onChange={handlePhotoChange} style={{ display: "none" }}
            />
            <p style={{ fontSize: 13, color: "#6b7280", margin: "8px 0 0" }}>JPG, PNG · Maks. 2 MB</p>
          </div>
        </div>

        {/* Form Fields dengan spacing yang sedikit diperlebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Field label="Full Name"      value={form.name}          onChange={set("name")}          placeholder="John Doe"                  required />
          <Field label="Business Name"  value={form.business_name} onChange={set("business_name")} placeholder="UMKM Business Solutions"    required />
          <Field label="Email Address"  type="email" value={form.email} onChange={set("email")}    placeholder="john.doe@business.com"      required />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 32 }}>
          <Btn variant="outline" onClick={handleReset} disabled={saving} style={{ borderRadius: "6px" }}>Reset</Btn>
          <Btn onClick={handleSave} disabled={saving} style={{ borderRadius: "6px" }}>
            {saving ? "Menyimpan…" : "💾 Save Changes"}
          </Btn>
        </div>
      </div>

      {/* ── Card 2: Sesi Aktif / Logout ─────── */}
      <div style={{
        ...styles.card,
        marginTop: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        borderLeft: "4px solid #4F46E5",
        padding: "20px 24px",
        borderRadius: "12px",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)"
      }}>
        <div>
          <p style={{ fontSize: 15, fontWeight: 600, color: "#111827", margin: "0 0 4px" }}>
            Sesi Aktif
          </p>
          <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
            Login sebagai{" "}
            <strong style={{ color: "#374151" }}>{user?.email ?? "—"}</strong>
          </p>
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 20px", borderRadius: "6px",
            border: "1px solid #ef4444", background: "none",
            color: "#ef4444", fontSize: 14, fontWeight: 600,
            cursor: loggingOut ? "not-allowed" : "pointer",
            opacity: loggingOut ? 0.6 : 1,
            whiteSpace: "nowrap", flexShrink: 0,
            transition: "all .2s ease",
          }}
          onMouseEnter={e => { if (!loggingOut) { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.borderColor = "#dc2626"; } }}
          onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.borderColor = "#ef4444"; }}
        >
          {loggingOut ? "Keluar…" : "Logout"}
        </button>
      </div>

    </div>
  );
}