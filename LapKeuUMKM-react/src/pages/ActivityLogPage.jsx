import { useState } from "react";
import { StatCard, Table } from "../components.jsx";
import styles from "../styles.js";
// import { apiFetch } from "../api.js"; // TODO D.6

export default function ActivityLogPage() {
  const [logs] = useState([]); // TODO D.6: fetch dari GET /api/activity-logs

  return (
    <div>
      <h1 style={styles.pageTitle}>Activity Log</h1>
      <div style={styles.statsRow}>
        <StatCard label="TOTAL ACTIVITIES"   value={logs.length} subtitle="All time records" />
        <StatCard label="TODAY'S ACTIVITIES" value={0}           subtitle="Activities today" />
        <StatCard label="SYSTEM MONITORING"  value="Active"      subtitle="Real-time tracking" accent />
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