import styles from "./styles.js";
import { useAuth } from "./contexts.jsx";

// =========================================================
// UTILS
// =========================================================

export const toRp = (val) =>
  "Rp " + Number(val ?? 0).toLocaleString("id-ID", { minimumFractionDigits: 0 });

// ===========================================================
// SVG ICONS
// =========================================================

export function DashboardIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1" stroke={color} strokeWidth="1.5"/>
      <rect x="9" y="1" width="6" height="6" rx="1" stroke={color} strokeWidth="1.5"/>
      <rect x="1" y="9" width="6" height="6" rx="1" stroke={color} strokeWidth="1.5"/>
      <rect x="9" y="9" width="6" height="6" rx="1" stroke={color} strokeWidth="1.5"/>
    </svg>
  );
}

export function PurchaseIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M2 2h1.5l2 8h7l1.5-5H5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="7" cy="13" r="1" fill={color}/>
      <circle cx="11" cy="13" r="1" fill={color}/>
    </svg>
  );
}

export function SalesIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.5"/>
      <path d="M8 5v3l2 2" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function CashIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1" y="4" width="14" height="9" rx="1.5" stroke={color} strokeWidth="1.5"/>
      <circle cx="8" cy="8.5" r="2" stroke={color} strokeWidth="1.5"/>
      <path d="M4 4V3a1 1 0 011-1h6a1 1 0 011 1v1" stroke={color} strokeWidth="1.5"/>
    </svg>
  );
}

export function InventoryIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M8 1v14M2 4.5l6 3.5 6-3.5" stroke={color} strokeWidth="1.5"/>
    </svg>
  );
}

export function SupplierIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M2 6.5L8 2l6 4.5V13a1 1 0 01-1 1h-3v-4H6v4H3a1 1 0 01-1-1V6.5Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M2 7l6-4.5L14 7" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function ReportsIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="12" height="12" rx="1.5" stroke={color} strokeWidth="1.5"/>
      <path d="M5 11V8M8 11V6M11 11V9" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function ActivityIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M1 8h2l2-5 3 10 2-7 1.5 2H15" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function PanduanIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="1" width="10" height="13" rx="1" stroke={color} strokeWidth="1.5"/>
      <path d="M5 5h5M5 8h5M5 11h3" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function UserIcon({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="7" r="3.5" stroke={color} strokeWidth="1.5"/>
      <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function LogoIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="6" fill="#4F46E5"/>
      <path d="M7 20V12l7-5 7 5v8" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
      <rect x="11" y="15" width="6" height="5" rx="0.5" fill="white"/>
    </svg>
  );
}

// =========================================================
// SHARED UI COMPONENTS
// =========================================================

export function StatCard({ label, value, subtitle, accent = false }) {
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

export function Btn({ children, onClick, variant = "primary", size = "md", type = "button", disabled = false }) {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 6,
    border: "none", borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 600, transition: "opacity .15s, transform .1s",
    opacity: disabled ? 0.6 : 1,
    fontSize: size === "sm" ? 13 : 14,
    padding: size === "sm" ? "6px 12px" : "9px 18px",
  };
  const variants = {
    primary: { background: "#4F46E5", color: "#fff" },
    success: { background: "#22c55e", color: "#fff" },
    danger:  { background: "#ef4444", color: "#fff" },
    outline: { background: "#fff", color: "#374151", border: "1.5px solid #e5e7eb" },
    ghost:   { background: "transparent", color: "#6b7280" },
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

export function Table({ columns, data, emptyMsg = "Tidak ada data." }) {
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

export function Modal({ title, onClose, children }) {
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

export function Field({ label, type = "text", value, onChange, placeholder, required }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={styles.fieldLabel}>
        {label}{required && <span style={{ color: "#ef4444" }}> *</span>}
      </label>
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

export function SelectField({ label, value, onChange, options, required }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={styles.fieldLabel}>
        {label}{required && <span style={{ color: "#ef4444" }}> *</span>}
      </label>
      <select value={value} onChange={onChange} required={required} style={styles.input}>
        <option value="">-- Pilih --</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

// =========================================================
// SIDEBAR LAYOUT
// =========================================================

const NAV_ITEMS = [
  { path: "/dashboard",    label: "Dashboard",       icon: DashboardIcon },
  { path: "/purchases",    label: "Input Pembelian", icon: PurchaseIcon  },
  { path: "/suppliers",    label: "Suppliers",       icon: SupplierIcon  },
  { path: "/sales",        label: "Input Penjualan", icon: SalesIcon     },
  { path: "/cashflow",     label: "Input Kas",       icon: CashIcon      },
  { path: "/inventory",    label: "Input Inventory", icon: InventoryIcon },
  { path: "/reports",      label: "Reports",         icon: ReportsIcon   },
  { path: "/activity-log", label: "Activity Log",    icon: ActivityIcon  },
  { path: "/panduan",      label: "Panduan",         icon: PanduanIcon   },
];

export function SidebarLayout({ children, currentPath, navigate }) {
  const { logout } = useAuth();

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

        {/* Logout */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid #f3f4f6" }}>
          <button
            onClick={async () => { await logout(); navigate("/login"); }}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              width: "100%", padding: "8px 0",
              background: "none", border: "none",
              fontSize: 13, color: "#ef4444", cursor: "pointer",
            }}>
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
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