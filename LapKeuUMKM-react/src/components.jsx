import { useState } from "react";
import styles from "./styles.js";
import { useAuth } from "./contexts.jsx";

// =========================================================
// UTILS
// =========================================================

export const toRp = (val) =>
  "Rp " + Number(val ?? 0).toLocaleString("id-ID", { minimumFractionDigits: 0 });

// Note 4: Quantity ditampilkan sebagai bilangan bulat (tanpa .00)
// Contoh: 100.00 → "100", 1500 → "1.500" (separator ribuan id-ID)
export const toQty = (val) =>
  Math.round(Number(val ?? 0)).toLocaleString("id-ID");

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

// Note 2: PhoneField — dropdown kode negara + input digit
// Cara pakai:
//   <PhoneField label="Phone" value={form.phone} onChange={(fullPhone) => setForm(f => ({...f, phone: fullPhone}))} required />
// `value` dan callback mengembalikan string E.164 lengkap, mis. "+6281234567890"

const COUNTRY_CODES = [
  { code: "+62",  flag: "🇮🇩", label: "ID (+62)"  },
  { code: "+1",   flag: "🇺🇸", label: "US (+1)"   },
  { code: "+44",  flag: "🇬🇧", label: "UK (+44)"  },
  { code: "+65",  flag: "🇸🇬", label: "SG (+65)"  },
  { code: "+60",  flag: "🇲🇾", label: "MY (+60)"  },
  { code: "+61",  flag: "🇦🇺", label: "AU (+61)"  },
  { code: "+81",  flag: "🇯🇵", label: "JP (+81)"  },
  { code: "+82",  flag: "🇰🇷", label: "KR (+82)"  },
  { code: "+86",  flag: "🇨🇳", label: "CN (+86)"  },
  { code: "+91",  flag: "🇮🇳", label: "IN (+91)"  },
  { code: "+971", flag: "🇦🇪", label: "AE (+971)" },
  { code: "+966", flag: "🇸🇦", label: "SA (+966)" },
];

// Pisahkan string E.164 (mis. "+6281234567") jadi [kodeNegara, nomorLokal]
function splitPhone(fullPhone) {
  if (!fullPhone) return { countryCode: "+62", localNumber: "" };
  const match = COUNTRY_CODES.find(c => fullPhone.startsWith(c.code));
  if (match) return { countryCode: match.code, localNumber: fullPhone.slice(match.code.length) };
  return { countryCode: "+62", localNumber: fullPhone.replace(/^\+?/, "") };
}

export function PhoneField({ label, value, onChange, required }) {
  const { countryCode, localNumber } = splitPhone(value);

  const handleCode = (e) => {
    const newCode = e.target.value;
    onChange(newCode + localNumber);
  };

  const handleNumber = (e) => {
    // Hanya izinkan digit (0-9)
    const digits = e.target.value.replace(/\D/g, "");
    onChange(countryCode + digits);
  };

  const selectStyle = {
    height: 40,
    border: "1.5px solid #e5e7eb",
    borderRadius: "8px 0 0 8px",
    borderRight: "none",
    padding: "0 8px",
    fontSize: 13,
    color: "#374151",
    background: "#f9fafb",
    cursor: "pointer",
    outline: "none",
  };

  const inputStyle = {
    flex: 1,
    height: 40,
    border: "1.5px solid #e5e7eb",
    borderRadius: "0 8px 8px 0",
    padding: "0 12px",
    fontSize: 14,
    color: "#111827",
    background: "#fff",
    outline: "none",
  };

  return (
    <div style={{ marginBottom: 14 }}>
      <label style={styles.fieldLabel}>
        {label}
        {required && <span style={{ color: "#ef4444", marginLeft: 3 }}>*</span>}
      </label>
      <div style={{ display: "flex" }}>
        <select value={countryCode} onChange={handleCode} style={selectStyle}>
          {COUNTRY_CODES.map(c => (
            <option key={c.code} value={c.code}>{c.flag} {c.label}</option>
          ))}
        </select>
        <input
          type="text"
          inputMode="numeric"
          value={localNumber}
          onChange={handleNumber}
          placeholder="81234567890"
          style={inputStyle}
        />
      </div>
      {localNumber && (
        <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 3, marginBottom: 0 }}>
          Nomor lengkap: {countryCode}{localNumber}
        </p>
      )}
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
// PAGINATION (Input 5)
// =========================================================

/**
 * Hook FE-only pagination — slice data yang sudah di-fetch.
 */
export function usePagination(data, pageSize = 10) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil((data?.length ?? 0) / pageSize));
  const safePage   = Math.min(page, totalPages);
  const paginated  = (data ?? []).slice((safePage - 1) * pageSize, safePage * pageSize);
  return { paginated, page: safePage, setPage, totalPages, total: data?.length ?? 0 };
}

export function PaginationBar({ page, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const delta = 2;
  const range = [];
  for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
    range.push(i);
  }

  const base    = { minWidth:32, height:32, border:"1.5px solid #e5e7eb", borderRadius:6, background:"#fff",
    cursor:"pointer", fontSize:13, color:"#374151", display:"inline-flex", alignItems:"center", justifyContent:"center" };
  const active  = { ...base, background:"#4F46E5", color:"#fff", borderColor:"#4F46E5", fontWeight:700 };
  const disabled= { ...base, opacity:.4, cursor:"not-allowed" };

  return (
    <div style={{ display:"flex", justifyContent:"flex-end", alignItems:"center", gap:4, marginTop:12 }}>
      <button style={page<=1?disabled:base} disabled={page<=1} onClick={()=>onPageChange(page-1)}>‹</button>
      {range[0]>1 && <>
        <button style={base} onClick={()=>onPageChange(1)}>1</button>
        {range[0]>2 && <span style={{padding:"0 4px",color:"#9ca3af"}}>…</span>}
      </>}
      {range.map(n=>(
        <button key={n} style={n===page?active:base} onClick={()=>onPageChange(n)}>{n}</button>
      ))}
      {range[range.length-1]<totalPages && <>
        {range[range.length-1]<totalPages-1 && <span style={{padding:"0 4px",color:"#9ca3af"}}>…</span>}
        <button style={base} onClick={()=>onPageChange(totalPages)}>{totalPages}</button>
      </>}
      <button style={page>=totalPages?disabled:base} disabled={page>=totalPages} onClick={()=>onPageChange(page+1)}>›</button>
      <span style={{fontSize:12,color:"#9ca3af",marginLeft:6}}>Hal. {page}/{totalPages}</span>
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
          <button
            onClick={() => navigate("/profile")}
            title="Profile Settings"
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
          >
            <div style={styles.userBadge}>
              <div style={styles.userAvatar}>
                <UserIcon size={16} color="#4F46E5" />
              </div>
            </div>
          </button>
        </header>

        {/* Page content */}
        <main style={styles.pageContent}>
          {children}
        </main>
      </div>
    </div>
  );
}