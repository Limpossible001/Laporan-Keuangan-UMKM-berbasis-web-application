import { StatCard, Table } from "../components.jsx";
import styles from "../styles.js";

function ChartPlaceholder({ title, subtitle }) {
  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>{title}</h3>
      <p style={styles.cardSub}>{subtitle}</p>
      <div style={{
        height: 160, background: "#f9fafb", borderRadius: 8,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#9ca3af", fontSize: 13,
      }}>
        Chart akan dirender di sini (Recharts — Tahap E)
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div>
      <h1 style={styles.pageTitle}>Dashboard</h1>
      <div style={styles.statsRow}>
        <StatCard label="TOTAL INCOME"      value="Rp 0" subtitle="— 0% vs last month" />
        <StatCard label="TOTAL EXPENSES"    value="Rp 0" subtitle="— 0% vs last month" />
        <StatCard label="NET PROFIT / LOSS" value="Rp 0" subtitle="— 0% vs last month" />
        <StatCard label="CURRENT BALANCE"   value="Rp 0" subtitle="All time balance" accent />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <ChartPlaceholder title="Cash Flow Trend"     subtitle="Last 7 days performance" />
        <ChartPlaceholder title="Income vs Expense"   subtitle="Last 7 days comparison" />
      </div>

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