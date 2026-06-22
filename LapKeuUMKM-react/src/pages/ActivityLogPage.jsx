import { useState, useEffect } from "react";
import { StatCard, Table } from "../components.jsx";
import { useNotif } from "../contexts.jsx";
import styles from "../styles.js";
import { apiFetch } from "../api.js";

export default function ActivityLogPage() {
  const { showNotif } = useNotif();
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/activity-logs");
      setLogs(res);
    } catch (e) {
      showNotif(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const fmtTimestamp = (val) => {
    if (!val) return "—";
    try {
      return new Date(val).toLocaleString("id-ID", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
    } catch { return val; }
  };

  const todayCount = logs.filter(l => {
    if (!l.logged_at) return false;
    const logDate = new Date(l.logged_at);
    const today = new Date();
    return logDate.toDateString() === today.toDateString();
  }).length;

  return (
    <div>
      <h1 style={styles.pageTitle}>Activity Log</h1>
      <div style={styles.statsRow}>
        <StatCard label="TOTAL ACTIVITIES"   value={logs.length} subtitle="All time records" />
        <StatCard label="TODAY'S ACTIVITIES" value={todayCount}  subtitle="Activities today" />
        <StatCard label="SYSTEM MONITORING"  value="Active"      subtitle="Real-time tracking" accent />
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Activity Log</h3>
        <p style={styles.cardSub}>Recent user actions and system changes</p>
        <Table
          columns={[
            { key: "logged_at",   label: "TIMESTAMP", render: r => fmtTimestamp(r.logged_at) },
            { key: "action",      label: "ACTION", render: r => (
              <span style={{
                textTransform: "capitalize", fontWeight: 600,
                color: r.action === "created" ? "#22c55e" : r.action === "deleted" ? "#ef4444" : "#f59e0b",
              }}>
                {r.action}
              </span>
            )},
            { key: "module",      label: "MODULE" },
            { key: "description", label: "DESCRIPTION" },
          ]}
          data={logs}
          emptyMsg={loading ? "Memuat data..." : "No activity logs yet. System actions will be recorded here."}
        />
      </div>
    </div>
  );
}