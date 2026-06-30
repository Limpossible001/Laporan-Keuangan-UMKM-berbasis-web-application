import { useState, useEffect, useCallback } from "react";
import { StatCard, Btn, Table } from "../components.jsx";
import { toRp } from "../components.jsx";
import { apiFetch, apiDownload } from "../api.js";
import { useNotif } from "../contexts.jsx";
import styles from "../styles.js";

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

function ReportProfitLoss({ dateFrom, dateTo, data }) {
  const label = dateFrom && dateTo ? `${dateFrom} – ${dateTo}` : "Pilih rentang tanggal";
  const d = data ?? { total_income: 0, cogs: 0, operating_expenses: 0, total_expenses: 0, net_profit: 0, profit_margin: 0 };
  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>Profit & Loss Statement</h3>
      <p style={{ ...styles.cardSub, marginBottom: 20 }}>{label}</p>
      <ReportRow section="INCOME">
        <ReportLine label="Total Income" value={toRp(d.total_income)} color="#22c55e" />
      </ReportRow>
      <ReportRow section="EXPENSES">
        <ReportLine label="HPP (Pembelian)"   value={toRp(d.cogs)} color="#ef4444" />
        <ReportLine label="Biaya Operasional" value={toRp(d.operating_expenses)} color="#ef4444" />
        <ReportLine label="Total Expenses"    value={toRp(d.total_expenses)} color="#ef4444" bold />
      </ReportRow>
      <ReportRow section="NET PROFIT / LOSS" highlight>
        <ReportLine label="Net Profit / Loss" value={toRp(d.net_profit)} color={d.net_profit >= 0 ? "#22c55e" : "#ef4444"} bold />
        <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>Profit Margin: {d.profit_margin}%</p>
      </ReportRow>
    </div>
  );
}

function ReportCashFlow({ data }) {
  const d = data ?? { inflow: 0, outflow: 0, net: 0, count: 0, details: [] };
  return (
    <div>
      <div style={styles.statsRow}>
        <StatCard label="Cash Inflow"   value={toRp(d.inflow)}  subtitle={`${d.count} transactions`} />
        <StatCard label="Cash Outflow"  value={toRp(d.outflow)} subtitle={`${d.count} transactions`} />
        <StatCard label="Net Cash Flow" value={toRp(d.net)}     subtitle={`${d.count} total transactions`} accent />
      </div>
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Cash Flow Details</h3>
        <Table
          columns={[
            { key: "date",        label: "DATE" },
            { key: "description", label: "DESCRIPTION" },
            { key: "category",    label: "CATEGORY" },
            { key: "inflow",      label: "INFLOW",  render: r => r.inflow  ? toRp(r.inflow)  : "—" },
            { key: "outflow",     label: "OUTFLOW", render: r => r.outflow ? toRp(r.outflow) : "—" },
          ]}
          data={d.details}
        />
      </div>
    </div>
  );
}

function ReportCategory({ data }) {
  const income  = data?.income  ?? {};
  const expense = data?.expense ?? {};
  const incomeRows  = Object.entries(income);
  const expenseRows = Object.entries(expense);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Income by Category</h3>
        {incomeRows.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>No income data</div>
        ) : (
          incomeRows.map(([cat, amount]) => (
            <ReportLine key={cat} label={cat} value={toRp(amount)} color="#22c55e" />
          ))
        )}
      </div>
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Expenses by Category</h3>
        {expenseRows.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>No expense data</div>
        ) : (
          expenseRows.map(([cat, amount]) => (
            <ReportLine key={cat} label={cat} value={toRp(amount)} color="#ef4444" />
          ))
        )}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { showNotif } = useNotif();
  const [activeTab, setActiveTab] = useState("profit");
  const [dateFrom, setDateFrom]   = useState("");
  const [dateTo,   setDateTo]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [exporting, setExporting] = useState(false);

  const [profitData, setProfitData]     = useState(null);
  const [cashflowData, setCashflowData] = useState(null);
  const [categoryData, setCategoryData] = useState(null);

  const TAB_LABELS = {
    profit:   "Profit & Loss",
    cashflow: "Cash Flow",
    category: "Category Analysis",
  };

  const qs = useCallback(() => {
    const params = new URLSearchParams();
    if (dateFrom) params.append("from", dateFrom);
    if (dateTo)   params.append("to", dateTo);
    return params.toString() ? `?${params.toString()}` : "";
  }, [dateFrom, dateTo]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const query = qs();
      const [profit, cashflow, category] = await Promise.all([
        apiFetch(`/reports/profit-loss${query}`),
        apiFetch(`/reports/cash-flow${query}`),
        apiFetch(`/reports/category${query}`),
      ]);
      setProfitData(profit);
      setCashflowData(cashflow);
      setCategoryData(category);
    } catch (e) {
      showNotif(e.message ?? "Gagal memuat laporan", "error");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qs]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleExport = async (type) => {
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

  return (
    <div>
      <h1 style={styles.pageTitle}>Reports</h1>

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
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", paddingTop: 18 }}>
            <Btn variant="outline" size="sm" onClick={() => handleExport("pdf")} disabled={exporting}>
              📄 Export PDF
            </Btn>
            <Btn variant="outline" size="sm" onClick={() => handleExport("excel")} disabled={exporting}>
              📊 Export Excel
            </Btn>
          </div>
        </div>
      </div>

      <div style={styles.tabBar}>
        {Object.entries(TAB_LABELS).map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            style={{ ...styles.tabBtn, ...(activeTab === key ? styles.tabBtnActive : {}) }}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "#9ca3af", fontSize: 14 }}>Memuat laporan…</p>
      ) : (
        <>
          {activeTab === "profit"   && <ReportProfitLoss dateFrom={dateFrom} dateTo={dateTo} data={profitData} />}
          {activeTab === "cashflow" && <ReportCashFlow data={cashflowData} />}
          {activeTab === "category" && <ReportCategory data={categoryData} />}
        </>
      )}
    </div>
  );
}