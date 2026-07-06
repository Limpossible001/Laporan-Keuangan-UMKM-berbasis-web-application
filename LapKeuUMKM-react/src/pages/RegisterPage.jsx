import { useState, useCallback } from "react";
import { StatCard, Btn, Table } from "../components.jsx";
import { toRp } from "../components.jsx";
import { apiFetch, apiDownload } from "../api.js";
import { useNotif } from "../contexts.jsx";
import styles from "../styles.js";

// ── Komponen helper ────────────────────────────────────────────────────────

function ReportRow({ section, children, highlight }) {
  return (
    <div style={{ marginBottom: 16, padding: "12px 16px", background: highlight ? "#f0fdf4" : "#f9fafb", borderRadius: 8 }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: "#374151", letterSpacing: ".06em", marginBottom: 8 }}>{section}</p>
      {children}
    </div>
  );
}

function ReportLine({ label, value, color, bold }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
      <span style={{ fontSize: 14, color: "#374151", fontWeight: bold ? 700 : 400 }}>{label}</span>
      <span style={{ fontSize: 14, color: color ?? "#111827", fontWeight: bold ? 700 : 600 }}>{value}</span>
    </div>
  );
}

// Input 2: pesan sebelum laporan dibuka
function BlankState() {
  return (
    <div style={{
      padding: "48px 32px", textAlign: "center",
      background: "#f9fafb", borderRadius: 12, border: "1.5px dashed #d1d5db",
    }}>
      <p style={{ fontSize: 16, fontWeight: 700, color: "#374151", margin: 0 }}>
        Silahkan pilih <em>'tanggal dari'</em> sampai <em>'tanggal hingga'</em> untuk membuka Laporan Keuangan.
      </p>
      <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 8 }}>
        Kemudian klik tombol <strong>Buka</strong> untuk memuat laporan.
      </p>
    </div>
  );
}

// ── Sub-halaman laporan ────────────────────────────────────────────────────

function ReportProfitLoss({ data }) {
  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>Profit & Loss Statement</h3>
      <ReportRow section="INCOME">
        <ReportLine label="Total Income" value={toRp(data.total_income)} color="#22c55e" />
      </ReportRow>
      <ReportRow section="EXPENSES">
        <ReportLine label="HPP (Pembelian)"   value={toRp(data.cogs)} color="#ef4444" />
        <ReportLine label="Biaya Operasional" value={toRp(data.operating_expenses)} color="#ef4444" />
        <ReportLine label="Total Expenses"    value={toRp(data.total_expenses)} color="#ef4444" bold />
      </ReportRow>
      <ReportRow section="NET PROFIT / LOSS" highlight>
        <ReportLine label="Net Profit / Loss" value={toRp(data.net_profit)}
          color={data.net_profit >= 0 ? "#22c55e" : "#ef4444"} bold />
        <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>Margin: {data.profit_margin}%</p>
      </ReportRow>
    </div>
  );
}

function ReportCashFlow({ data }) {
  return (
    <div>
      <div style={styles.statsRow}>
        <StatCard label="Cash Inflow"   value={toRp(data.inflow)}  subtitle={`${data.count} transaksi`} />
        <StatCard label="Cash Outflow"  value={toRp(data.outflow)} subtitle={`${data.count} transaksi`} />
        <StatCard label="Net Cash Flow" value={toRp(data.net)}     subtitle="Bersih" accent />
      </div>
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Cash Flow Details</h3>
        <Table
          columns={[
            { key: "date",        label: "TANGGAL" },
            { key: "description", label: "KETERANGAN" },
            { key: "category",    label: "KATEGORI" },
            { key: "inflow",      label: "MASUK",  render: r => r.inflow  ? toRp(r.inflow)  : "—" },
            { key: "outflow",     label: "KELUAR", render: r => r.outflow ? toRp(r.outflow) : "—" },
          ]}
          data={data.details}
        />
      </div>
    </div>
  );
}

function ReportCategory({ data }) {
  const incomeRows  = Object.entries(data?.income  ?? {});
  const expenseRows = Object.entries(data?.expense ?? {});
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Income by Category</h3>
        {incomeRows.length === 0
          ? <p style={{ color: "#9ca3af", fontSize: 13 }}>No income data.</p>
          : incomeRows.map(([c, a]) => <ReportLine key={c} label={c} value={toRp(a)} color="#22c55e" />)
        }
      </div>
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Expenses by Category</h3>
        {expenseRows.length === 0
          ? <p style={{ color: "#9ca3af", fontSize: 13 }}>No expense data.</p>
          : expenseRows.map(([c, a]) => <ReportLine key={c} label={c} value={toRp(a)} color="#ef4444" />)
        }
      </div>
    </div>
  );
}

// ── Halaman utama ──────────────────────────────────────────────────────────

const MAX_LOAD_DAYS   = 92;   // Input 3: max 1 kuarter per Buka
const MAX_EXPORT_DAYS = 31;   // Input 3: max 31 hari per ekspor

export default function ReportsPage() {
  const { showNotif } = useNotif();
  const [activeTab, setActiveTab] = useState("profit");
  const [dateFrom, setDateFrom]   = useState("");
  const [dateTo,   setDateTo]     = useState("");

  // Input 2: laporan TIDAK dimuat otomatis — null = belum dibuka
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading]       = useState(false);
  const [exporting, setExporting]   = useState(false);

  const TAB_LABELS = {
    profit:   "Profit & Loss",
    cashflow: "Cash Flow",
    category: "Category Analysis",
  };

  // Input 2 + 3: validasi sebelum buka laporan
  const validateRange = useCallback((from, to, maxDays, label) => {
    if (!from || !to) {
      showNotif("Pilih 'From Date' dan 'To Date' terlebih dahulu", "error");
      return false;
    }
    const f = new Date(from), t = new Date(to);
    if (f > t) {
      showNotif("Tanggal awal lebih besar dari tanggal akhir", "error");
      return false;
    }
    const diffDays = Math.round((t - f) / 86400000);
    if (diffDays > maxDays) {
      showNotif(`Rentang ${label} maksimal ${maxDays} hari. Pilih rentang yang lebih kecil.`, "error");
      return false;
    }
    return true;
  }, [showNotif]);

  const qs = useCallback(() => {
    const p = new URLSearchParams();
    if (dateFrom) p.append("from", dateFrom);
    if (dateTo)   p.append("to",   dateTo);
    return p.toString() ? `?${p.toString()}` : "";
  }, [dateFrom, dateTo]);

  // Input 2: klik "Buka" → fetch ketiga endpoint
  const handleBuka = async () => {
    if (!validateRange(dateFrom, dateTo, MAX_LOAD_DAYS, "laporan")) return;
    setLoading(true);
    try {
      const query = qs();
      const [profit, cashflow, category] = await Promise.all([
        apiFetch(`/reports/profit-loss${query}`),
        apiFetch(`/reports/cash-flow${query}`),
        apiFetch(`/reports/category${query}`),
      ]);
      setReportData({ profit, cashflow, category });
    } catch (e) {
      showNotif(e.message ?? "Gagal memuat laporan", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    if (!validateRange(dateFrom, dateTo, MAX_EXPORT_DAYS, "ekspor")) return;
    setExporting(true);
    try {
      await apiDownload(`/reports/export/${type}${qs()}`);
      showNotif(`Export ${type.toUpperCase()} berhasil diunduh`);
    } catch (e) {
      showNotif(e.message ?? `Gagal export ${type}`, "error");
    } finally {
      setExporting(false);
    }
  };

  // Reset laporan saat tanggal berubah supaya data lama tidak membingungkan
  const handleDateChange = (setter) => (e) => {
    setter(e.target.value);
    setReportData(null);
  };

  return (
    <div>
      <h1 style={styles.pageTitle}>Reports</h1>

      {/* ── Filter tanggal + tombol ── */}
      <div style={styles.card}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>

          {/* From Date dengan tanda * merah (Input 2) */}
          <div style={{ flex: 1, minWidth: 160 }}>
            <label style={styles.fieldLabel}>
              From Date <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="date" value={dateFrom}
              onChange={handleDateChange(setDateFrom)}
              style={styles.input}
            />
          </div>

          {/* To Date dengan tanda * merah (Input 2) */}
          <div style={{ flex: 1, minWidth: 160 }}>
            <label style={styles.fieldLabel}>
              To Date <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="date" value={dateTo}
              onChange={handleDateChange(setDateTo)}
              style={styles.input}
            />
          </div>

          {/* Tombol Buka (Input 2) + Export — urutan kiri ke kanan */}
          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={handleBuka} disabled={loading}>
              {loading ? "Memuat…" : "Buka"}
            </Btn>
            <Btn variant="outline" size="sm" onClick={() => handleExport("pdf")} disabled={exporting}>
              📄 Export PDF
            </Btn>
            <Btn variant="outline" size="sm" onClick={() => handleExport("excel")} disabled={exporting}>
              📊 Export Excel
            </Btn>
          </div>
        </div>

        {/* Keterangan restriksi (Input 3) */}
        <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 10, marginBottom: 0 }}>
          📋 Buka Laporan: maks. 92 hari &nbsp;|&nbsp; 📤 Ekspor: maks. 31 hari per unduhan
        </p>
      </div>

      {/* ── Tab navigasi — selalu tampil (Input 2) ── */}
      <div style={styles.tabBar}>
        {Object.entries(TAB_LABELS).map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            style={{ ...styles.tabBtn, ...(activeTab === key ? styles.tabBtnActive : {}) }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Konten: BlankState atau data (Input 2) ── */}
      {!reportData ? (
        <BlankState />
      ) : (
        <>
          {activeTab === "profit"   && <ReportProfitLoss data={reportData.profit} />}
          {activeTab === "cashflow" && <ReportCashFlow   data={reportData.cashflow} />}
          {activeTab === "category" && <ReportCategory   data={reportData.category} />}
        </>
      )}
    </div>
  );
}