import { useState, useEffect } from "react";
import { StatCard, Btn, Table, Modal, Field, SelectField, PaginationBar, usePagination, toRp, fmtDate } from "../components.jsx";
import { useNotif } from "../contexts.jsx";
import styles from "../styles.js";
import { apiFetch } from "../api.js";

// ── Helper tanggal ──────────────────────────────────────────────
// Ambil tanggal hari ini dalam format ISO (yyyy-mm-dd) berdasarkan waktu lokal browser
function todayIso() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Konversi yyyy-mm-dd -> dd-mm-yyyy untuk ditampilkan ke user
function isoToDisplay(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return "";
  return `${d}-${m}-${y}`;
}

// ── Komponen Field Tanggal Terkunci ─────────────────────────────
function LockedDateField({ label = "Sale Date", value, onChange, required }) {
  const today = todayIso();

  useEffect(() => {
    if (!value) onChange(today);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayValue = isoToDisplay(value || today);

  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>

      <div style={{ position: "relative" }}>
        <input
          type="text"
          readOnly
          value={displayValue}
          placeholder="dd-mm-yyyy"
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "10px 36px 10px 12px",
            border: "1px solid #d1d5db",
            borderRadius: 8,
            fontSize: 14,
            color: "#111827",
            background: "#f9fafb",
            cursor: "pointer",
          }}
        />

        <span
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
            fontSize: 16,
          }}
        >
          📅
        </span>

        <input
          type="date"
          value={value || today}
          min={today}
          max={today}
          onChange={(e) => onChange(e.target.value)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0,
            cursor: "pointer",
          }}
        />
      </div>

      <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
        Hanya tanggal hari ini yang bisa dipilih (tidak bisa backdate / forward date).
      </p>
    </div>
  );
}

const CATEGORIES = [
  { value: "operasional", label: "Operasional" },
  { value: "modal",       label: "Modal" },
  { value: "penjualan",   label: "Penjualan" },
  { value: "pembelian",   label: "Pembelian" },
  { value: "lain-lain",   label: "Lain-lain" },
];

// Tahap 3: badge kecil untuk menandai entry yang otomatis tersinkron dari
// Input Pembelian / Input Penjualan, supaya jelas terlihat beda dari entry
// manual yang dibuat langsung lewat "+ Add Cash In/Out" di halaman ini.
function SourceBadge({ row }) {
  if (!row.is_auto) {
    return <span style={{ fontSize: 12, color: "#9ca3af" }}>Manual</span>;
  }
  const isPurchase = row.source_type === "purchase";
  return (
    <span
      title="Entry ini otomatis dibuat & disinkronkan dari data transaksi asli — edit/hapus lewat halaman aslinya."
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 11,
        fontWeight: 600,
        padding: "3px 8px",
        borderRadius: 999,
        background: isPurchase ? "#fee2e2" : "#dcfce7",
        color: isPurchase ? "#b91c1c" : "#15803d",
      }}
    >
      ● Otomatis · {isPurchase ? "Input Pembelian" : "Input Penjualan"}
    </span>
  );
}

export default function CashFlowPage() {
  const { showNotif } = useNotif();
  const [data, setData]       = useState([]);
  const { paginated, page, setPage, totalPages } = usePagination(data, 10);
  const [loading, setLoading] = useState(true);
  const [showIn, setShowIn]   = useState(false);
  const [showOut, setShowOut] = useState(false);
  const [form, setForm]       = useState({
    date: todayIso(), type: "in", description: "", category: "", amount: ""
  });

  const set     = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const openIn  = () => { setForm(f => ({ ...f, type: "in"  })); setShowIn(true);  };
  const openOut = () => { setForm(f => ({ ...f, type: "out" })); setShowOut(true); };
  const close   = ()  => { setShowIn(false); setShowOut(false); };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/cashflows");
      setData(res);
    } catch (e) {
      showNotif(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAdd = async () => {
    if (!form.date || !form.description || !form.amount) {
      showNotif("Field wajib harus diisi", "error"); return;
    }
    if (Number(form.amount) <= 0) {
      showNotif("Jumlah harus lebih dari 0", "error"); return;
    }
    if (form.date !== todayIso()){
      showNotif("Tanggal penjualan harus hari ini", "error"); return;
    }

    try {
      const payload = {
        date: form.date,
        type: form.type,
        description: form.description,
        category: form.category,
        amount: Number(form.amount),
      };
      const res = await apiFetch("/cashflows", { method: "POST", body: JSON.stringify(payload) });
      setData(d => [res, ...d]);
      setForm({ date: todayIso(), type: "in", description: "", category: "", amount: "" });
      close();
      showNotif(`Cash ${form.type === "in" ? "In" : "Out"} berhasil ditambahkan`);
    } catch (e) {
      showNotif(e.message, "error");
    }
  };

  // Catatan: entry yang is_auto === true (otomatis dari Input Pembelian /
  // Input Penjualan) ditolak oleh backend (422) kalau dihapus dari sini —
  // pesan errornya akan diteruskan lewat notifikasi ke user.
  const handleDelete = async (id) => {
    try {
      await apiFetch(`/cashflows/${id}`, { method: "DELETE" });
      setData(d => d.filter(x => x.id !== id));
      showNotif("Data berhasil dihapus");
    } catch (e) {
      showNotif(e.message, "error");
    }
  };

  const cashIn  = data.filter(r => r.type === "in" ).reduce((s, r) => s + Number(r.amount), 0);
  const cashOut = data.filter(r => r.type === "out").reduce((s, r) => s + Number(r.amount), 0);

  return (
    <div>
      <div style={styles.statsRow}>
        <StatCard label="CASH IN"       value={toRp(cashIn)}          subtitle="Total cash received" />
        <StatCard label="CASH OUT"      value={toRp(cashOut)}          subtitle="Total cash paid" />
        <StatCard label="NET CASH FLOW" value={toRp(cashIn - cashOut)} subtitle="Cash In - Cash Out" accent />
      </div>

      <div style={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h3 style={styles.cardTitle}>Cash Flow Records</h3>
            <p style={styles.cardSub}>
              All cash in and cash out transactions — termasuk otomatis dari Input Pembelian &amp; Input Penjualan
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="success" onClick={openIn}>+ Add Cash In</Btn>
            <Btn variant="danger"  onClick={openOut}>+ Add Cash Out</Btn>
          </div>
        </div>
        <Table
          columns={[
            { key: "date",        label: "DATE",     render: r => fmtDate(r.date) },
            { key: "type",        label: "TYPE", render: r => (
              <span style={{ color: r.type === "in" ? "#16a34a" : "#dc2626", fontWeight: 600 }}>
                {r.type === "in" ? "Cash In" : "Cash Out"}
              </span>
            )},
            { key: "description", label: "DESCRIPTION" },
            { key: "category",    label: "CATEGORY" },
            { key: "amount",      label: "AMOUNT", render: r => toRp(r.amount) },
            { key: "source",      label: "SOURCE", render: r => <SourceBadge row={r} /> },
          ]}
          data={paginated}
          emptyMsg={loading ? "Memuat data..." : 'No cash flow records yet. Click "Add Cash In" or "Add Cash Out" to create one.'}
        />
        <PaginationBar page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Perbaikan: Modal di-render secara inline, menghindari komponen di dalam komponen */}
      {(showIn || showOut) && (
        <Modal title={`Add Cash ${form.type === "in" ? "In" : "Out"}`} onClose={close}>
          <LockedDateField
            label="Transaction Date" 
            value={form.date} 
            onChange={(val) => setForm(f => ({ ...f, date: val }))} 
            required
          />
          <div style={{ marginBottom: 14 }}>
            <label style={styles.fieldLabel}>Transaction Type</label>
            <select value={form.type} onChange={set("type")} style={styles.input}>
              <option value="in">Cash In</option>
              <option value="out">Cash Out</option>
            </select>
          </div>
          <Field
            label="Description"
            value={form.description} onChange={set("description")}
            placeholder="Enter description" required
          />
          <SelectField
            label="Category"
            value={form.category} onChange={set("category")}
            options={CATEGORIES} required
          />
          <Field
            label="Amount (Rp)" type="number"
            value={form.amount} onChange={set("amount")}
            min="1" step="1" required
          />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn variant="outline" onClick={close}>Cancel</Btn>
            <Btn variant={form.type === "in" ? "success" : "danger"} onClick={handleAdd}>
              Add Cash {form.type === "in" ? "In" : "Out"}
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}