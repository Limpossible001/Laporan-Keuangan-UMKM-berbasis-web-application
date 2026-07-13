import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import { StatCard } from "../components.jsx";
import { toRp, toQty } from "../components.jsx";
import { apiFetch } from "../api.js";
import { useNotif } from "../contexts.jsx";
import styles from "../styles.js";

// ── Tooltip formatter rupiah ──────────────────────────────
const RpTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:"8px 12px", fontSize:12 }}>
      <p style={{ margin:"0 0 4px", fontWeight:700, color:"#374151" }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ margin:"2px 0", color: p.color }}>
          {p.name}: {toRp(p.value)}
        </p>
      ))}
    </div>
  );
};

const QtyTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:"8px 12px", fontSize:12 }}>
      <p style={{ margin:"0 0 4px", fontWeight:700, color:"#374151" }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ margin:"2px 0", color: p.color }}>
          {p.name}: {toQty(p.value)} unit
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const { showNotif } = useNotif();
  const [stats, setStats]           = useState(null);
  const [weeklyCF, setWeeklyCF]     = useState([]);
  const [top5, setTop5]             = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch("/dashboard");
        setStats(data.stats);
        setWeeklyCF(data.weekly_cashflow);
        setTop5(data.top5_products);
      } catch (e) {
        showNotif(e.message ?? "Gagal memuat dashboard", "error");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const s = stats ?? { total_income: 0, total_expenses: 0, net_profit: 0, cash_balance: 0 };

  return (
    <div>
      {/* ── 4 StatCards ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 16, marginBottom: 24,
      }}>
        <StatCard
          label="TOTAL INCOME"
          value={loading ? "—" : toRp(s.total_income)}
          subtitle="Seluruh penjualan"
        />
        <StatCard
          label="TOTAL EXPENSES"
          value={loading ? "—" : toRp(s.total_expenses)}
          subtitle="Pembelian + biaya kas"
        />
        <StatCard
          label="NET PROFIT / LOSS"
          value={loading ? "—" : toRp(s.net_profit)}
          subtitle={s.net_profit >= 0 ? "Laba bersih" : "Rugi bersih"}
        />
        <StatCard
          label="SALDO KAS"
          value={loading ? "—" : toRp(s.cash_balance)}
          subtitle="Kas masuk − kas keluar"
          accent
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

        {/* ── LineChart: tren kas masuk vs keluar per minggu ── */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Tren Arus Kas Mingguan</h3>
          <p style={{ ...styles.cardSub, marginBottom: 16 }}>Kas masuk vs keluar — 7 minggu terakhir</p>
          {loading ? (
            <div style={{ height: 200, display:"flex", alignItems:"center", justifyContent:"center", color:"#9ca3af" }}>
              Memuat…
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyCF} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#6b7280" }} />
                <YAxis tickFormatter={v => `${(v/1000000).toFixed(1)}jt`} tick={{ fontSize: 10, fill: "#6b7280" }} width={48} />
                <Tooltip content={<RpTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="inflow"  name="Kas Masuk"  stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="outflow" name="Kas Keluar" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ── BarChart: top 5 produk terlaris ── */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Top 5 Produk Terlaris</h3>
          <p style={{ ...styles.cardSub, marginBottom: 16 }}>Berdasarkan total unit terjual</p>
          {loading ? (
            <div style={{ height: 200, display:"flex", alignItems:"center", justifyContent:"center", color:"#9ca3af" }}>
              Memuat…
            </div>
          ) : top5.length === 0 ? (
            <div style={{ height: 200, display:"flex", alignItems:"center", justifyContent:"center", color:"#9ca3af", fontSize:13 }}>
              Belum ada data penjualan.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={top5} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#6b7280" }} />
                <YAxis type="category" dataKey="product" width={100} tick={{ fontSize: 10, fill: "#374151" }} />
                <Tooltip content={<QtyTooltip />} />
                <Bar dataKey="qty" name="Unit Terjual" fill="#4F46E5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}