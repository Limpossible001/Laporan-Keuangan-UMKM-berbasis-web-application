import { useState } from "react";
import { StatCard, Btn, Table } from "../components.jsx";
import { toRp } from "../components.jsx";
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

function ReportProfitLoss({ dateFrom, dateTo }) {
  const label = dateFrom && dateTo ? `${dateFrom} – ${dateTo}` : "Pilih rentang tanggal";
  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>Profit & Loss Statement</h3>
      <p style={{ ...styles.cardSub, marginBottom: 20 }}>{label}</p>
      <ReportRow section="INCOME">
        <ReportLine label="Total Income"   value="Rp 0" color="#22c55e" />
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

function ReportCashFlow() {
  return (
    <div>
      <div style={styles.statsRow}>
        <StatCard label="Cash Inflow"  value="Rp 0" subtitle="0 transactions" />
        <StatCard label="Cash Outflow" value="Rp 0" subtitle="0 transactions" />
        <StatCard label="Net Cash Flow" value="Rp 0" subtitle="0 total transactions" accent />
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
        <div style={{ height: 200, background: "#f9fafb", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 13 }}>
          Bar chart — Tahap E
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
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
            {/* TODO F.4: ganti alert dengan trigger download dari backend */}
            <Btn variant="outline" size="sm" onClick={() => alert("Export PDF — Tahap F")}>📄 Export PDF</Btn>
            <Btn variant="outline" size="sm" onClick={() => alert("Export Excel — Tahap F")}>📊 Export Excel</Btn>
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

      {activeTab === "profit"   && <ReportProfitLoss dateFrom={dateFrom} dateTo={dateTo} />}
      {activeTab === "cashflow" && <ReportCashFlow />}
      {activeTab === "category" && <ReportCategory />}
    </div>
  );
}