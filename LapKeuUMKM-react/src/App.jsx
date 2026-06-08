import { useState, useEffect, createContext, useContext } from "react";

// ============================================================
// SECTION 1: CONSTANTS & CONFIG
// ============================================================

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

// Route definitions — satu tempat untuk semua nama & path
const ROUTES = {
  LOGIN:        "/login",
  REGISTER:     "/register",
  DASHBOARD:    "/dashboard",
  PURCHASES:    "/purchases",
  SALES:        "/sales",
  CASHFLOW:     "/cashflow",
  INVENTORY:    "/inventory",
  REPORTS:      "/reports",
  ACTIVITY_LOG: "/activity-log",
  PANDUAN:      "/panduan",
};

// Navigasi sidebar (urutan sesuai Figma)
const NAV_ITEMS = [
  { path: ROUTES.DASHBOARD,    label: "Dashboard",        icon: DashboardIcon },
  { path: ROUTES.PURCHASES,    label: "Input Pembelian",  icon: PurchaseIcon },
  { path: ROUTES.SALES,        label: "Input Penjualan",  icon: SalesIcon },
  { path: ROUTES.CASHFLOW,     label: "Input Kas",        icon: CashIcon },
  { path: ROUTES.INVENTORY,    label: "Input Inventory",  icon: InventoryIcon },
  { path: ROUTES.REPORTS,      label: "Reports",          icon: ReportsIcon },
  { path: ROUTES.ACTIVITY_LOG, label: "Activity Log",     icon: ActivityIcon },
  { path: ROUTES.PANDUAN,      label: "Panduan",          icon: PanduanIcon },
];

// ============================================================
// SECTION 2: AUTH CONTEXT
// ============================================================

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  // user: null = belum login, object = sudah login
  const [user, setUser]       = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Restore session dari localStorage saat app pertama load
  useEffect(() => {
    const stored = localStorage.getItem("umkm_user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* invalid JSON */ }
    }
    setAuthLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("umkm_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("umkm_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return useContext(AuthContext);
}

// ============================================================
// SECTION 3: NOTIFICATION CONTEXT
// ============================================================

const NotifContext = createContext(null);

function NotifProvider({ children }) {
  const [notif, setNotif] = useState(null); // { message, type: 'success'|'error' }

  const showNotif = (message, type = "success") => {
    setNotif({ message, type });
    setTimeout(() => setNotif(null), 3000);
  };

  return (
    <NotifContext.Provider value={{ notif, showNotif }}>
      {children}
      {notif && (
        <div style={styles.notifWrapper}>
          <div style={{
            ...styles.notif,
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

function useNotif() {
  return useContext(NotifContext);
}

// ============================================================
// SECTION 4: API HELPER
// ============================================================

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }
  return res.json();
}

// ============================================================
// SECTION 5: SIMPLE ROUTER (Hash-based, no library needed)
// ============================================================

function useHashRouter() {
  const getPath = () => {
    const hash = window.location.hash.replace("#", "") || ROUTES.LOGIN;
    // strip query string dari path
    return hash.split("?")[0];
  };

  const [currentPath, setCurrentPath] = useState(getPath);

  useEffect(() => {
    const handler = () => setCurrentPath(getPath());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const navigate = (path) => {
    window.location.hash = path;
  };

  return { currentPath, navigate };
}

// ============================================================
// SECTION 6: SVG ICON COMPONENTS
// Sesuai ikon sidebar di Figma
// ============================================================

function DashboardIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1" stroke={color} strokeWidth="1.5"/>
      <rect x="9" y="1" width="6" height="6" rx="1" stroke={color} strokeWidth="1.5"/>
      <rect x="1" y="9" width="6" height="6" rx="1" stroke={color} strokeWidth="1.5"/>
      <rect x="9" y="9" width="6" height="6" rx="1" stroke={color} strokeWidth="1.5"/>
    </svg>
  );
}

function PurchaseIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M2 2h1.5l2 8h7l1.5-5H5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="7" cy="13" r="1" fill={color}/>
      <circle cx="11" cy="13" r="1" fill={color}/>
    </svg>
  );
}

function SalesIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.5"/>
      <path d="M8 5v3l2 2" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function CashIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1" y="4" width="14" height="9" rx="1.5" stroke={color} strokeWidth="1.5"/>
      <circle cx="8" cy="8.5" r="2" stroke={color} strokeWidth="1.5"/>
      <path d="M4 4V3a1 1 0 011-1h6a1 1 0 011 1v1" stroke={color} strokeWidth="1.5"/>
    </svg>
  );
}

function InventoryIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M8 1v14M2 4.5l6 3.5 6-3.5" stroke={color} strokeWidth="1.5"/>
    </svg>
  );
}

function ReportsIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="12" height="12" rx="1.5" stroke={color} strokeWidth="1.5"/>
      <path d="M5 11V8M8 11V6M11 11V9" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function ActivityIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M1 8h2l2-5 3 10 2-7 1.5 2H15" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function PanduanIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="1" width="10" height="13" rx="1" stroke={color} strokeWidth="1.5"/>
      <path d="M5 5h5M5 8h5M5 11h3" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function UserIcon({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="7" r="3.5" stroke={color} strokeWidth="1.5"/>
      <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function LogoIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="6" fill="#4F46E5"/>
      <path d="M7 20V12l7-5 7 5v8" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
      <rect x="11" y="15" width="6" height="5" rx="0.5" fill="white"/>
    </svg>
  );
}

// ============================================================
// SECTION 7: SHARED UI COMPONENTS
// ============================================================

// Kartu statistik (dipakai di semua halaman input & dashboard)
function StatCard({ label, value, subtitle, accent = false }) {
  return (
    <div style={{ ...styles.statCard, ...(accent ? styles.statCardAccent : {}) }}>
      <p style={{ ...styles.statLabel, color: accent ? "rgba(255,255,255,0.8)" : "#6b7280" }}>
        {label}
      </p>
      <p style={{ ...styles.statValue, color: accent ? "#fff" : "#111827" }}>
        {value}
      </p>
      {subtitle && (
        <p style={{ ...styles.statSub, color: accent ? "rgba(255,255,255,0.7)" : "#9ca3af" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

// Tombol utama
function Btn({ children, onClick, variant = "primary", size = "md", type = "button", disabled = false }) {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 6,
    border: "none", borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 600, transition: "opacity .15s, transform .1s",
    opacity: disabled ? 0.6 : 1,
    fontSize: size === "sm" ? 13 : 14,
    padding: size === "sm" ? "6px 12px" : "9px 18px",
  };
  const variants = {
    primary:   { background: "#4F46E5", color: "#fff" },
    success:   { background: "#22c55e", color: "#fff" },
    danger:    { background: "#ef4444", color: "#fff" },
    outline:   { background: "#fff", color: "#374151", border: "1.5px solid #e5e7eb" },
    ghost:     { background: "transparent", color: "#6b7280" },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{ ...base, ...variants[variant] }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = "0.85"; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
      {children}
    </button>
  );
}

// Tabel generik
function Table({ columns, data, emptyMsg = "Tidak ada data." }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={styles.table}>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} style={styles.th}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={styles.tdEmpty}>{emptyMsg}</td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={row.id ?? i} style={i % 2 === 0 ? {} : { background: "#f9fafb" }}>
                {columns.map(col => (
                  <td key={col.key} style={styles.td}>
                    {col.render ? col.render(row) : (row[col.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// Modal / popup (dipakai semua halaman input)
function Modal({ title, onClose, children }) {
  // tutup saat klik backdrop
  return (
    <div style={styles.modalBackdrop} onClick={onClose}>
      <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>{title}</h3>
          <button onClick={onClose} style={styles.modalClose}>✕</button>
        </div>
        <div style={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
}

// Input field
function Field({ label, type = "text", value, onChange, placeholder, required }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={styles.fieldLabel}>{label}{required && <span style={{ color: "#ef4444" }}> *</span>}</label>
      <input
        type={type} value={value} onChange={onChange}
        placeholder={placeholder} required={required}
        style={styles.input}
        onFocus={e => { e.target.style.borderColor = "#4F46E5"; e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,.12)"; }}
        onBlur={e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}

// Select field
function SelectField({ label, value, onChange, options, required }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={styles.fieldLabel}>{label}{required && <span style={{ color: "#ef4444" }}> *</span>}</label>
      <select value={value} onChange={onChange} required={required} style={styles.input}>
        <option value="">-- Pilih --</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

// Rupiah formatter
const toRp = (val) =>
  "Rp " + Number(val ?? 0).toLocaleString("id-ID", { minimumFractionDigits: 0 });

// ============================================================
// SECTION 8: AUTH PAGES (Login & Register)
// Gradient biru-ungu sesuai Figma
// ============================================================

function LoginPage({ navigate }) {
  const { login }    = useAuth();
  const { showNotif } = useNotif();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) { showNotif("Email dan password wajib diisi", "error"); return; }
    setLoading(true);
    try {
      // TODO: ganti dengan endpoint auth Laravel saat tersedia
      // const data = await apiFetch("/auth/login", { method:"POST", body: JSON.stringify({email,password}) });
      // Sementara: simulasi login berhasil
      await new Promise(r => setTimeout(r, 600));
      login({ name: "User UMKM", email });
      showNotif("Login successful");
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

        <Btn onClick={handleSubmit} disabled={loading} size="md">
          {loading ? "Loading…" : "Login to Dashboard"}
        </Btn>

        <div style={{ textAlign: "center", margin: "16px 0", color: "#9ca3af", fontSize: 13 }}>or</div>

        <Btn variant="outline" onClick={() => {
          login({ name: "Demo User", email: "demo@umkm.id" });
          navigate(ROUTES.DASHBOARD);
        }}>
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

function RegisterPage({ navigate }) {
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
      // TODO: await apiFetch("/auth/register", { method:"POST", body: JSON.stringify(form) });
      await new Promise(r => setTimeout(r, 600));
      login({ name: form.name, email: form.email });
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

        <Field label="Full Name"     value={form.name}     onChange={set("name")}     placeholder="John Doe"               required />
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

// ============================================================
// SECTION 9: SIDEBAR LAYOUT
// ============================================================

function SidebarLayout({ children, currentPath, navigate }) {
  const { user, logout } = useAuth();

  return (
    <div style={styles.appShell}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        {/* Logo */}
        <div style={styles.sidebarLogo}>
          <LogoIcon />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>UMKM</div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>Finance</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1 }}>
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const active = currentPath === path;
            return (
              <button key={path} onClick={() => navigate(path)}
                style={{ ...styles.navItem, ...(active ? styles.navItemActive : {}) }}>
                <Icon size={16} color={active ? "#4F46E5" : "#6b7280"} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* MAIN AREA */}
      <div style={styles.mainArea}>
        {/* Topbar */}
        <header style={styles.topbar}>
          <div style={{ flex: 1 }} />
          <div style={styles.userBadge}>
            <div style={styles.userAvatar}>
              <UserIcon size={16} color="#4F46E5" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={styles.pageContent}>
          {children}
        </main>
      </div>
    </div>
  );
}

// ============================================================
// SECTION 10: PAGE PLACEHOLDERS
// Setiap halaman siap diisi konten penuh di file terpisah nanti
// ============================================================

// ── Dashboard ─────────────────────────────────────────────
function DashboardPage() {
  return (
    <div>
      <h1 style={styles.pageTitle}>Dashboard</h1>
      {/* Summary cards */}
      <div style={styles.statsRow}>
        <StatCard label="TOTAL INCOME"    value="Rp 0" subtitle="— 0% vs last month" />
        <StatCard label="TOTAL EXPENSES"  value="Rp 0" subtitle="— 0% vs last month" />
        <StatCard label="NET PROFIT / LOSS" value="Rp 0" subtitle="— 0% vs last month" />
        <StatCard label="CURRENT BALANCE" value="Rp 0" subtitle="All time balance" accent />
      </div>

      {/* Charts placeholder */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <ChartPlaceholder title="Cash Flow Trend" subtitle="Last 7 days performance" />
        <ChartPlaceholder title="Income vs Expense" subtitle="Last 7 days comparison" />
      </div>

      {/* Recent Transactions */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Recent Transactions</h3>
        <p style={styles.cardSub}>Your latest financial activities</p>
        <Table
          columns={[
            { key: "date",        label: "DATE" },
            { key: "transaction", label: "TRANSACTION" },
            { key: "category",    label: "CATEGORY" },
            { key: "type",        label: "TYPE" },
            { key: "amount",      label: "AMOUNT" },
          ]}
          data={[]}
          emptyMsg="No transactions yet. Start by adding sales, purchases, or cash flows."
        />
      </div>
    </div>
  );
}

function ChartPlaceholder({ title, subtitle }) {
  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>{title}</h3>
      <p style={styles.cardSub}>{subtitle}</p>
      <div style={{ height: 160, background: "#f9fafb", borderRadius: 8,
        display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 13 }}>
        Chart akan dirender di sini (Recharts / Chart.js)
      </div>
    </div>
  );
}

// ── Input Pembelian ───────────────────────────────────────
function PurchasesPage() {
  const { showNotif } = useNotif();
  const [data, setData]     = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]     = useState({ date: "", supplier_name: "", item_name: "", quantity: "", unit_price: "" });

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleAdd = async () => {
    try {
      // const res = await apiFetch("/purchases", { method:"POST", body: JSON.stringify({ ...form, total_amount: form.quantity * form.unit_price }) });
      // setData(d => [res, ...d]);
      const newItem = { id: Date.now(), ...form, total_amount: form.quantity * form.unit_price };
      setData(d => [newItem, ...d]);
      setForm({ date: "", supplier_name: "", item_name: "", quantity: "", unit_price: "" });
      setShowModal(false);
      showNotif("Data pembelian berhasil ditambahkan");
    } catch (e) { showNotif(e.message, "error"); }
  };

  const totalAmount = data.reduce((s, r) => s + Number(r.total_amount), 0);
  const avgPurchase = data.length ? totalAmount / data.length : 0;

  return (
    <div>
      <h1 style={styles.pageTitle}>Input Pembelian</h1>
      <div style={styles.statsRow}>
        <StatCard label="TOTAL PURCHASES" value={data.length} subtitle="Total records" />
        <StatCard label="TOTAL AMOUNT"    value={toRp(totalAmount)} subtitle="All time purchases" />
        <StatCard label="AVERAGE PURCHASE" value={toRp(avgPurchase)} subtitle="Per transaction" accent />
      </div>

      <div style={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h3 style={styles.cardTitle}>Purchase Records</h3>
            <p style={styles.cardSub}>All purchase transactions</p>
          </div>
          <Btn onClick={() => setShowModal(true)}>+ Add Purchase</Btn>
        </div>
        <Table
          columns={[
            { key: "date",          label: "DATE" },
            { key: "supplier_name", label: "SUPPLIER" },
            { key: "item_name",     label: "ITEM" },
            { key: "quantity",      label: "QUANTITY" },
            { key: "unit_price",    label: "UNIT PRICE", render: r => toRp(r.unit_price) },
            { key: "total_amount",  label: "TOTAL",      render: r => toRp(r.total_amount) },
            { key: "actions", label: "ACTIONS", render: r => (
              <Btn variant="danger" size="sm" onClick={() => setData(d => d.filter(x => x.id !== r.id))}>Hapus</Btn>
            )},
          ]}
          data={data}
          emptyMsg='No purchase records yet. Click "Add Purchase" to create one.'
        />
      </div>

      {showModal && (
        <Modal title="Add Purchase" onClose={() => setShowModal(false)}>
          <Field label="Transaction Date" type="date" value={form.date}       onChange={set("date")}          required />
          <Field label="Supplier Name"               value={form.supplier_name} onChange={set("supplier_name")} placeholder="Enter supplier name" required />
          <Field label="Item Name"                   value={form.item_name}   onChange={set("item_name")}      placeholder="Enter item name"     required />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Quantity"   type="number" value={form.quantity}   onChange={set("quantity")}   required />
            <Field label="Unit Price" type="number" value={form.unit_price} onChange={set("unit_price")} required />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn variant="outline" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn onClick={handleAdd}>Add Purchase</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Input Penjualan ───────────────────────────────────────
function SalesPage() {
  const { showNotif } = useNotif();
  const [data, setData]     = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]     = useState({ date: "", product_name: "", quantity: "", unit_price: "", customer_notes: "" });

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleAdd = async () => {
    try {
      const newItem = { id: Date.now(), ...form, total_revenue: form.quantity * form.unit_price };
      setData(d => [newItem, ...d]);
      setForm({ date: "", product_name: "", quantity: "", unit_price: "", customer_notes: "" });
      setShowModal(false);
      showNotif("Data penjualan berhasil ditambahkan");
    } catch (e) { showNotif(e.message, "error"); }
  };

  const totalRevenue = data.reduce((s, r) => s + Number(r.total_revenue), 0);
  const totalItems   = data.reduce((s, r) => s + Number(r.quantity), 0);

  return (
    <div>
      <h1 style={styles.pageTitle}>Input Penjualan</h1>
      <div style={styles.statsRow}>
        <StatCard label="TOTAL SALES"    value={data.length} subtitle="Total transactions" />
        <StatCard label="TOTAL REVENUE"  value={toRp(totalRevenue)} subtitle="All time revenue" />
        <StatCard label="ITEMS SOLD"     value={totalItems} subtitle="Total units" accent />
      </div>

      <div style={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h3 style={styles.cardTitle}>Sales Records</h3>
            <p style={styles.cardSub}>All sales transactions</p>
          </div>
          <Btn variant="success" onClick={() => setShowModal(true)}>+ Add Sale</Btn>
        </div>
        <Table
          columns={[
            { key: "date",          label: "DATE" },
            { key: "product_name",  label: "PRODUCT" },
            { key: "quantity",      label: "QUANTITY" },
            { key: "unit_price",    label: "UNIT PRICE",    render: r => toRp(r.unit_price) },
            { key: "total_revenue", label: "TOTAL REVENUE", render: r => toRp(r.total_revenue) },
            { key: "customer_notes",label: "NOTES" },
            { key: "actions", label: "ACTIONS", render: r => (
              <Btn variant="danger" size="sm" onClick={() => setData(d => d.filter(x => x.id !== r.id))}>Hapus</Btn>
            )},
          ]}
          data={data}
          emptyMsg='No sales records yet. Click "Add Sale" to create one.'
        />
      </div>

      {showModal && (
        <Modal title="Add Sale" onClose={() => setShowModal(false)}>
          <Field label="Sale Date"     type="date" value={form.date}         onChange={set("date")}         required />
          <div style={{ marginBottom: 14 }}>
            <label style={styles.fieldLabel}>Product Name <span style={{ color: "#ef4444" }}>*</span></label>
            <select value={form.product_name} onChange={set("product_name")} style={styles.input}>
              <option value="">Select a product</option>
              {/* TODO: populate dari inventory API */}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Quantity Sold" type="number" value={form.quantity}   onChange={set("quantity")}   required />
            <Field label="Unit Price"    type="number" value={form.unit_price} onChange={set("unit_price")} required />
          </div>
          <Field label="Customer Notes (Optional)" value={form.customer_notes} onChange={set("customer_notes")} placeholder="Optional notes" />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn variant="outline" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn variant="success" onClick={handleAdd}>Add Sale</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Input Kas ─────────────────────────────────────────────
function CashFlowPage() {
  const { showNotif } = useNotif();
  const [data, setData]         = useState([]);
  const [showIn, setShowIn]     = useState(false);
  const [showOut, setShowOut]   = useState(false);
  const [form, setForm]         = useState({ date: "", type: "in", description: "", category: "", amount: "" });

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const openIn  = () => { setForm(f => ({ ...f, type: "in" }));  setShowIn(true); };
  const openOut = () => { setForm(f => ({ ...f, type: "out" })); setShowOut(true); };
  const close   = ()  => { setShowIn(false); setShowOut(false); };

  const handleAdd = async () => {
    try {
      const newItem = { id: Date.now(), ...form };
      setData(d => [newItem, ...d]);
      setForm({ date: "", type: "in", description: "", category: "", amount: "" });
      close();
      showNotif(`Cash ${form.type === "in" ? "In" : "Out"} berhasil ditambahkan`);
    } catch (e) { showNotif(e.message, "error"); }
  };

  const cashIn  = data.filter(r => r.type === "in" ).reduce((s, r) => s + Number(r.amount), 0);
  const cashOut = data.filter(r => r.type === "out").reduce((s, r) => s + Number(r.amount), 0);

  const CATEGORIES = [
    { value: "operasional", label: "Operasional" },
    { value: "modal",       label: "Modal" },
    { value: "penjualan",   label: "Penjualan" },
    { value: "pembelian",   label: "Pembelian" },
    { value: "lain-lain",   label: "Lain-lain" },
  ];

  const CashModal = ({ type }) => (
    <Modal title={`Add Cash ${type === "in" ? "In" : "Out"}`} onClose={close}>
      <Field label="Transaction Date" type="date" value={form.date} onChange={set("date")} required />
      <div style={{ marginBottom: 14 }}>
        <label style={styles.fieldLabel}>Transaction Type</label>
        <select value={form.type} onChange={set("type")} style={styles.input}>
          <option value="in">Cash In</option>
          <option value="out">Cash Out</option>
        </select>
      </div>
      <Field label="Description" value={form.description} onChange={set("description")} placeholder="Enter description" required />
      <SelectField label="Category" value={form.category} onChange={set("category")} options={CATEGORIES} required />
      <Field label="Amount" type="number" value={form.amount} onChange={set("amount")} required />
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
        <Btn variant="outline" onClick={close}>Cancel</Btn>
        <Btn variant={type === "in" ? "success" : "danger"} onClick={handleAdd}>
          Add Cash {type === "in" ? "In" : "Out"}
        </Btn>
      </div>
    </Modal>
  );

  return (
    <div>
      <h1 style={styles.pageTitle}>Input Kas</h1>
      <div style={styles.statsRow}>
        <StatCard label="CASH IN"       value={toRp(cashIn)}        subtitle="Total cash received" />
        <StatCard label="CASH OUT"      value={toRp(cashOut)}        subtitle="Total cash paid" />
        <StatCard label="NET CASH FLOW" value={toRp(cashIn - cashOut)} subtitle="Cash In - Cash Out" accent />
      </div>

      <div style={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h3 style={styles.cardTitle}>Cash Flow Records</h3>
            <p style={styles.cardSub}>All cash in and cash out transactions</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="success" onClick={openIn}>+ Add Cash In</Btn>
            <Btn variant="danger"  onClick={openOut}>+ Add Cash Out</Btn>
          </div>
        </div>
        <Table
          columns={[
            { key: "date",        label: "DATE" },
            { key: "type",        label: "TYPE", render: r => (
              <span style={{ color: r.type === "in" ? "#22c55e" : "#ef4444", fontWeight: 600 }}>
                {r.type === "in" ? "Cash In" : "Cash Out"}
              </span>
            )},
            { key: "description", label: "DESCRIPTION" },
            { key: "category",    label: "CATEGORY" },
            { key: "amount",      label: "AMOUNT", render: r => toRp(r.amount) },
            { key: "actions", label: "ACTIONS", render: r => (
              <Btn variant="danger" size="sm" onClick={() => setData(d => d.filter(x => x.id !== r.id))}>Hapus</Btn>
            )},
          ]}
          data={data}
          emptyMsg='No cash flow records yet. Click "Add Cash In" or "Add Cash Out" to create one.'
        />
      </div>

      {showIn  && <CashModal type="in" />}
      {showOut && <CashModal type="out" />}
    </div>
  );
}

// ── Input Inventory ───────────────────────────────────────
function InventoryPage() {
  const { showNotif } = useNotif();
  const [data, setData]     = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]     = useState({ product_name: "", category: "", unit_price: "", quantity: "", notes: "" });

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleAdd = async () => {
    try {
      const newItem = { id: Date.now(), ...form, last_updated: new Date().toLocaleDateString("id-ID"), status: Number(form.quantity) > 10 ? "OK" : "Low" };
      setData(d => [newItem, ...d]);
      setForm({ product_name: "", category: "", unit_price: "", quantity: "", notes: "" });
      setShowModal(false);
      showNotif("Item inventory berhasil ditambahkan");
    } catch (e) { showNotif(e.message, "error"); }
  };

  const lowStock = data.filter(r => Number(r.quantity) < 10).length;

  return (
    <div>
      <h1 style={styles.pageTitle}>Input Inventory</h1>
      <div style={styles.statsRow}>
        <StatCard label="TOTAL PRODUCTS" value={data.length}                                           subtitle="Unique items" />
        <StatCard label="TOTAL STOCK"    value={data.reduce((s, r) => s + Number(r.quantity), 0)} subtitle="Total units" />
        <StatCard label="LOW STOCK ALERT!" value={lowStock} subtitle="Items below 10 units" accent />
      </div>

      <div style={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h3 style={styles.cardTitle}>Inventory List</h3>
            <p style={styles.cardSub}>Manage your product stock</p>
          </div>
          <Btn onClick={() => setShowModal(true)}>+ Add Inventory Item</Btn>
        </div>
        <Table
          columns={[
            { key: "product_name",  label: "PRODUCT NAME" },
            { key: "quantity",      label: "QUANTITY" },
            { key: "last_updated",  label: "LAST UPDATED" },
            { key: "notes",         label: "NOTES" },
            { key: "status",        label: "STATUS", render: r => (
              <span style={{ color: r.status === "OK" ? "#22c55e" : "#f59e0b", fontWeight: 600 }}>{r.status}</span>
            )},
            { key: "actions", label: "ACTIONS", render: r => (
              <Btn variant="danger" size="sm" onClick={() => setData(d => d.filter(x => x.id !== r.id))}>Hapus</Btn>
            )},
          ]}
          data={data}
          emptyMsg='No Inventory Items yet. Click "Add Inventory Item" to create one.'
        />
      </div>

      {showModal && (
        <Modal title="Add Inventory Item" onClose={() => setShowModal(false)}>
          <Field label="Product Name" value={form.product_name} onChange={set("product_name")} placeholder="Enter product name" required />
          <Field label="Category"     value={form.category}     onChange={set("category")}     placeholder="Enter category" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Unit Price"        type="number" value={form.unit_price} onChange={set("unit_price")} required />
            <Field label="Initial Quantity"  type="number" value={form.quantity}   onChange={set("quantity")}   required />
          </div>
          <Field label="Notes (Optional)" value={form.notes} onChange={set("notes")} placeholder="Optional notes" />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn variant="outline" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn onClick={handleAdd}>Add Item</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Reports ───────────────────────────────────────────────
// 3 sub-tab: Profit & Loss | Cash Flow | Category Analysis
function ReportsPage() {
  const [activeTab, setActiveTab] = useState("profit");
  const [dateFrom, setDateFrom]   = useState("");
  const [dateTo,   setDateTo]     = useState("");

  const TAB_LABELS = {
    profit:   "Profit & Loss",
    cashflow: "Cash Flow",
    category: "Category Analysis",
  };

  return (
    <div>
      <h1 style={styles.pageTitle}>Reports</h1>

      {/* Date filter + Export buttons — sesuai Figma */}
      <div style={styles.card}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label style={styles.fieldLabel}>From Date</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={styles.input} />
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label style={styles.fieldLabel}>To Date</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={styles.input} />
          </div>
          {/* Export buttons — komposisi final sesuai Figma v3.0 */}
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", paddingTop: 18 }}>
            <Btn variant="outline" size="sm" onClick={() => alert("Export PDF — TODO: integrasi backend")}>
              📄 Export PDF
            </Btn>
            <Btn variant="outline" size="sm" onClick={() => alert("Export Excel — TODO: integrasi backend")}>
              📊 Export Excel
            </Btn>
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={styles.tabBar}>
        {Object.entries(TAB_LABELS).map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            style={{ ...styles.tabBtn, ...(activeTab === key ? styles.tabBtnActive : {}) }}>
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "profit"   && <ReportProfitLoss   dateFrom={dateFrom} dateTo={dateTo} />}
      {activeTab === "cashflow" && <ReportCashFlow      dateFrom={dateFrom} dateTo={dateTo} />}
      {activeTab === "category" && <ReportCategory      dateFrom={dateFrom} dateTo={dateTo} />}
    </div>
  );
}

function ReportProfitLoss({ dateFrom, dateTo }) {
  const label = dateFrom && dateTo ? `${dateFrom} – ${dateTo}` : "01 April 2026 – 30 April 2026";
  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>Profit & Loss Statement</h3>
      <p style={{ ...styles.cardSub, marginBottom: 20 }}>{label}</p>
      <ReportRow section="INCOME">
        <ReportLine label="Total Income" value="Rp 0" color="#22c55e" />
      </ReportRow>
      <ReportRow section="EXPENSES">
        <ReportLine label="Total Expenses" value="Rp 0" color="#ef4444" />
      </ReportRow>
      <ReportRow section="NET PROFIT / LOSS" highlight>
        <ReportLine label="Net Profit / Loss" value="Rp 0" color="#22c55e" bold />
        <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>Profit Margin: 0%</p>
      </ReportRow>
    </div>
  );
}

function ReportCashFlow({ dateFrom, dateTo }) {
  return (
    <div>
      <div style={styles.statsRow}>
        <StatCard label="Cash Inflow"     value="Rp 0" subtitle="0 transactions" />
        <StatCard label="Cash Outflow"    value="Rp 0" subtitle="0 transactions" />
        <StatCard label="Net Cash Flow"   value="Rp 0" subtitle="0 total transactions" accent />
      </div>
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Cash Flow Details</h3>
        <Table
          columns={[
            { key: "date",        label: "DATE" },
            { key: "description", label: "DESCRIPTION" },
            { key: "category",    label: "CATEGORY" },
            { key: "inflow",      label: "INFLOW" },
            { key: "outflow",     label: "OUTFLOW" },
          ]}
          data={[]}
        />
      </div>
    </div>
  );
}

function ReportCategory() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Income by Category</h3>
        <div style={{ padding: "40px 0", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>No income data</div>
      </div>
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Expenses by Category</h3>
        <div style={{ padding: "40px 0", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>No expense data</div>
      </div>
      <div style={{ ...styles.card, gridColumn: "1 / -1" }}>
        <h3 style={styles.cardTitle}>Category Comparison</h3>
        <div style={{ height: 200, background: "#f9fafb", borderRadius: 8,
          display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 13 }}>
          Bar chart akan dirender di sini
        </div>
      </div>
    </div>
  );
}

function ReportRow({ section, children, highlight }) {
  return (
    <div style={{ marginBottom: 16, padding: "12px 16px", background: highlight ? "#f0fdf4" : "#f9fafb", borderRadius: 8 }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: "#374151", letterSpacing: ".06em", marginBottom: 8 }}>
        {section}
      </p>
      {children}
    </div>
  );
}

function ReportLine({ label, value, color, bold }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
      <span style={{ fontSize: 14, color: "#374151", fontWeight: bold ? 700 : 400 }}>{label}</span>
      <span style={{ fontSize: 14, color: color ?? "#111827", fontWeight: bold ? 700 : 600 }}>{value}</span>
    </div>
  );
}

// ── Activity Log ──────────────────────────────────────────
function ActivityLogPage() {
  const [logs] = useState([]); // TODO: fetch dari /api/activity-logs

  return (
    <div>
      <h1 style={styles.pageTitle}>Activity Log</h1>
      <div style={styles.statsRow}>
        <StatCard label="TOTAL ACTIVITIES"  value={logs.length} subtitle="All time records" />
        <StatCard label="TODAY'S ACTIVITIES" value={0}           subtitle="Activities today" />
        <StatCard label="SYSTEM MONITORING" value="Active"       subtitle="Real-time tracking" accent />
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Activity Log</h3>
        <p style={styles.cardSub}>Recent user actions and system changes</p>
        <Table
          columns={[
            { key: "timestamp",   label: "TIMESTAMP" },
            { key: "action",      label: "ACTION" },
            { key: "module",      label: "MODULE" },
            { key: "description", label: "DESCRIPTION" },
          ]}
          data={logs}
          emptyMsg="No activity logs yet. System actions will be recorded here."
        />
      </div>
    </div>
  );
}

// ── Panduan ───────────────────────────────────────────────
function PanduanPage() {
  const sections = [
    {
      icon: "🛒", title: "Input Pembelian (Purchase Input)",
      steps: [
        'Navigate to "Input Pembelian" from the sidebar menu',
        'Click the "Add Purchase" button',
        "Fill in: Transaction Date, Supplier Name, Item Name, Quantity, Unit Price",
        "The system will automatically calculate the total amount",
        'Click "Add Purchase" to save the record',
      ],
      tip: "All purchase records will be reflected in your financial reports and affect your expense calculations.",
    },
    {
      icon: "💵", title: "Input Penjualan (Sales Input)",
      steps: [
        'Navigate to "Input Penjualan" from the sidebar menu',
        'Click the "Add Sale" button',
        "Fill in: Sale Date, Product Name (from inventory), Quantity Sold, Unit Price",
        "Add optional Customer Notes",
        'Click "Add Sale" to save',
      ],
      tip: "Sales data automatically updates your revenue totals and inventory stock levels.",
    },
    {
      icon: "💰", title: "Input Kas (Cash Flow Input)",
      steps: [
        'Navigate to "Input Kas" from the sidebar menu',
        'Click "Add Cash In" for incoming cash or "Add Cash Out" for outgoing cash',
        "Fill in: Transaction Date, Description, Category, Amount",
        'Click "Add Cash In/Out" to save',
      ],
      tip: "Net Cash Flow = Total Cash In − Total Cash Out.",
    },
    {
      icon: "📦", title: "Input Inventory",
      steps: [
        'Navigate to "Input Inventory" from the sidebar menu',
        'Click "Add Inventory Item"',
        "Fill in: Product Name, Category, Unit Price, Initial Quantity",
        'Click "Add Item" to save',
      ],
      tip: "Items with quantity below 10 units will trigger a Low Stock Alert.",
    },
    {
      icon: "📊", title: "Reports",
      steps: [
        'Navigate to "Reports" from the sidebar menu',
        "Set the date range using From Date and To Date",
        "Switch between Profit & Loss, Cash Flow, and Category Analysis tabs",
        "Use Export PDF or Export Excel to download reports",
      ],
      tip: "Export buttons generate reports based on the selected date range.",
    },
  ];

  return (
    <div>
      <h1 style={styles.pageTitle}>Panduan</h1>
      <div style={styles.card}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
          User Guide – UMKM Financial Management System
        </h2>
        <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 24 }}>
          This guide will help you understand how to use the financial reporting system.
        </p>

        {/* System Overview */}
        <div style={{ ...styles.panduanSection, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 22 }}>📖</span>
            <div>
              <h3 style={{ margin: "0 0 8px", fontSize: 16 }}>System Overview</h3>
              <p style={{ color: "#374151", fontSize: 14, margin: "0 0 6px" }}>
                This UMKM Financial Management System is designed to help small businesses manage their finances
                following the same structure as Excel-based financial reporting templates.
              </p>
              <p style={{ color: "#374151", fontSize: 14, margin: 0 }}>
                The system tracks purchases, sales, cash flow, and inventory — all critical components of UMKM financial management.
              </p>
            </div>
          </div>
        </div>

        {sections.map((s, i) => (
          <div key={i} style={{ ...styles.panduanSection, marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 10px", fontSize: 15 }}>{s.title}</h3>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>How to use:</p>
                <ol style={{ margin: 0, paddingLeft: 20 }}>
                  {s.steps.map((step, j) => (
                    <li key={j} style={{ fontSize: 14, color: "#374151", marginBottom: 4 }}>{step}</li>
                  ))}
                </ol>
                {s.tip && (
                  <p style={{ marginTop: 10, fontSize: 13, color: "#6b7280", fontStyle: "italic" }}>
                    💡 Tip: {s.tip}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 404 ────────────────────────────────────────────────────
function NotFoundPage({ navigate }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <p style={{ fontSize: 48 }}>🔍</p>
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>Halaman tidak ditemukan</h2>
      <p style={{ color: "#6b7280", marginBottom: 20 }}>Path yang kamu akses tidak tersedia.</p>
      <Btn onClick={() => navigate(ROUTES.DASHBOARD)}>Kembali ke Dashboard</Btn>
    </div>
  );
}

// ============================================================
// SECTION 11: ROUTING TABLE
// ============================================================

function renderPage(path, navigate) {
  switch (path) {
    case ROUTES.DASHBOARD:    return <DashboardPage />;
    case ROUTES.PURCHASES:    return <PurchasesPage />;
    case ROUTES.SALES:        return <SalesPage />;
    case ROUTES.CASHFLOW:     return <CashFlowPage />;
    case ROUTES.INVENTORY:    return <InventoryPage />;
    case ROUTES.REPORTS:      return <ReportsPage />;
    case ROUTES.ACTIVITY_LOG: return <ActivityLogPage />;
    case ROUTES.PANDUAN:      return <PanduanPage />;
    default:                  return <NotFoundPage navigate={navigate} />;
  }
}

// ============================================================
// SECTION 12: ROOT APP
// ============================================================

function AppInner() {
  const { user, authLoading } = useAuth();
  const { currentPath, navigate } = useHashRouter();

  // Redirect logic
  useEffect(() => {
    if (authLoading) return;

    const isAuthPage = currentPath === ROUTES.LOGIN || currentPath === ROUTES.REGISTER;

    if (!user && !isAuthPage) {
      navigate(ROUTES.LOGIN);
    }
    if (user && (isAuthPage || currentPath === "/")) {
      navigate(ROUTES.DASHBOARD);
    }
  }, [user, authLoading, currentPath]);

  // Loading state
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

  // Auth pages — tanpa sidebar
  if (currentPath === ROUTES.LOGIN)    return <LoginPage    navigate={navigate} />;
  if (currentPath === ROUTES.REGISTER) return <RegisterPage navigate={navigate} />;

  // Protected pages — dengan sidebar
  if (!user) return null; // redirect sedang berjalan

  return (
    <SidebarLayout currentPath={currentPath} navigate={navigate}>
      {renderPage(currentPath, navigate)}
    </SidebarLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotifProvider>
        <AppInner />
      </NotifProvider>
    </AuthProvider>
  );
}

// ============================================================
// SECTION 13: STYLES
// Token warna konsisten dengan Figma v3.0
// ============================================================

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
  appShell: { display: "flex", minHeight: "100vh", background: "#f3f4f6" },
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
    width: "100%", padding: "8px 16px",
    background: "none", border: "none", textAlign: "left",
    fontSize: 13, color: "#374151", cursor: "pointer",
    borderRadius: 0, transition: "background .12s",
  },
  navItemActive: { background: "#ede9fe", color: "#4F46E5", fontWeight: 600 },
  mainArea: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0 },
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

  // Cards & Layout
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
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th:    { padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280",
           letterSpacing: ".06em", borderBottom: "1px solid #e5e7eb", textTransform: "uppercase" },
  td:    { padding: "10px 12px", color: "#374151", borderBottom: "1px solid #f3f4f6" },
  tdEmpty:{ padding: "32px", textAlign: "center", color: "#9ca3af", fontSize: 13 },

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
  tabBar:      { display: "flex", gap: 4, marginBottom: 16, borderBottom: "2px solid #e5e7eb" },
  tabBtn:      { background: "none", border: "none", padding: "8px 16px", fontSize: 14, cursor: "pointer", color: "#6b7280", fontWeight: 500, borderBottom: "2px solid transparent", marginBottom: -2 },
  tabBtnActive:{ color: "#4F46E5", fontWeight: 700, borderBottomColor: "#4F46E5" },

  // Panduan
  panduanSection: { background: "#f9fafb", borderRadius: 10, padding: "16px 18px" },

  // Notification
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
