import { useState, useEffect, useRef } from "react";
import { Btn, Field } from "../components.jsx";
import { useAuth, useNotif } from "../contexts.jsx";
import { apiFetch, apiFetchForm } from "../api.js";
import styles from "../styles.js";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

export default function ProfilePage() {
  const { user, login } = useAuth();
  const { showNotif }   = useNotif();
  const fileInputRef    = useRef(null);

  const [initial, setInitial] = useState(null); // snapshot utk tombol Reset
  const [form, setForm]       = useState({ name: "", business_name: "", email: "" });
  const [avatarFile, setAvatarFile]     = useState(null);   // File baru yg dipilih user
  const [avatarPreview, setAvatarPreview] = useState(null); // preview lokal (blob URL)
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  // Catatan #7: ambil data profile asli dari backend (GET /api/profile)
  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch("/profile");
        const snapshot = {
          name: data.user.name ?? "",
          business_name: data.user.business_name ?? "",
          email: data.user.email ?? "",
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
    setForm({
      name: initial.name,
      business_name: initial.business_name,
      email: initial.email,
    });
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
      fd.append("name", form.name);
      fd.append("business_name", form.business_name);
      fd.append("email", form.email);
      if (avatarFile) fd.append("avatar", avatarFile);

      const data = await apiFetchForm("/profile", fd);

      // Sinkronkan AuthContext (nama dipakai di Sidebar/Topbar) + localStorage
      login(data.user, localStorage.getItem("umkm_token"));

      const snapshot = {
        name: data.user.name,
        business_name: data.user.business_name,
        email: data.user.email,
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

  if (loading) {
    return <p style={{ color: "#9ca3af", fontSize: 14 }}>Memuat profile…</p>;
  }

  const currentPhoto = avatarPreview || initial?.avatar_url;

  return (
    // NOTE Catatan#7 (anotasi figma): jangan duplikasi judul halaman.
    // Topbar global SUDAH menampilkan ikon user; di sini cukup 1 judul
    // "Profile Settings" sebagai header card — tidak perlu <h1> generik lagi di atasnya.
    <div style={{ maxWidth: 560 }}>
      <div style={styles.card}>
        <h3 style={{ ...styles.cardTitle, fontSize: 18, marginBottom: 20 }}>Profile Settings</h3>

        {/* Profile Picture */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22 }}>
          <div
            style={{
              width: 64, height: 64, borderRadius: "50%", background: "#4F46E5",
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden", flexShrink: 0,
            }}
          >
            {currentPhoto ? (
              <img src={currentPhoto} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ color: "#fff", fontSize: 24 }}>👤</span>
            )}
          </div>
          <div>
            <Btn variant="outline" size="sm" onClick={handlePickPhoto}>Change Photo</Btn>
            <input
              ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png"
              onChange={handlePhotoChange} style={{ display: "none" }}
            />
            <p style={{ fontSize: 12, color: "#9ca3af", margin: "6px 0 0" }}>JPG, PNG. Max 2MB</p>
          </div>
        </div>

        <Field label="Full Name" value={form.name} onChange={set("name")} placeholder="John Doe" required />
        <Field label="Business Name" value={form.business_name} onChange={set("business_name")} placeholder="UMKM Business Solutions" required />
        <Field label="Email Address" type="email" value={form.email} onChange={set("email")} placeholder="john.doe@business.com" required />

        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <Btn variant="outline" onClick={handleReset} disabled={saving}>Reset</Btn>
          <Btn onClick={handleSave} disabled={saving}>
            {saving ? "Menyimpan…" : "💾 Save Changes"}
          </Btn>
        </div>
      </div>
    </div>
  );
}