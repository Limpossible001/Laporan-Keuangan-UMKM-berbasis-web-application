import { useState, useEffect } from "react";
import { StatCard, Btn, Table, Modal, Field, SelectField, PaginationBar, usePagination } from "../components.jsx";
import { useNotif } from "../contexts.jsx";
import { toRp, fmtDate } from "../components.jsx";
import styles from "../styles.js";
import { apiFetch } from "../api.js";

const CATEGORIES = [
  { value: "operasional", label: "Operasional" },
  { value: "modal",       label: "Modal" },
  { value: "penjualan",   label: "Penjualan" },
  { value: "pembelian",   label: "Pembelian" },
  { value: "lain-lain",   label: "Lain-lain" },
];

export default function CashFlowPage() {
  const { showNotif } = useNotif();
  const [data, setData]       = useState([]);
  const { paginated, page, setPage, totalPages } = usePagination(data, 10);
  const [loading, setLoading] = useState(true);
  const [showIn, setShowIn]   = useState(false);
  const [showOut, setShowOut] = useState(false);
  const [form, setForm]       = useState({
    date: "", type: "in", description: "", category: "", amount: ""
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
      setForm({ date: "", type: "in", description: "", category: "", amount: "" });
      close();
      showNotif(`Cash ${form.type === "in" ? "In" : "Out"} berhasil ditambahkan`);
    } catch (e) {
      showNotif(e.message, "error");
    }
  };

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

  const CashModal = ({ type }) => (
    <Modal title={`Add Cash ${type === "in" ? "In" : "Out"}`} onClose={close}>
      <Field
        label="Transaction Date" type="date"
        value={form.date} onChange={set("date")} required
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
        <Btn variant={type === "in" ? "success" : "danger"} onClick={handleAdd}>
          Add Cash {type === "in" ? "In" : "Out"}
        </Btn>
      </div>
    </Modal>
  );

  return (
    <div>
      <h1 style={styles.pageTitle}>Input Kas</h1>
      <div style={styles.statsRow}>
        <StatCard label="CASH IN"       value={toRp(cashIn)}          subtitle="Total cash received" />
        <StatCard label="CASH OUT"      value={toRp(cashOut)}          subtitle="Total cash paid" />
        <StatCard label="NET CASH FLOW" value={toRp(cashIn - cashOut)} subtitle="Cash In - Cash Out" accent />
      </div>

      <div style={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h3 style={styles.cardTitle}>Cash Flow Records</h3>
            <p style={styles.cardSub}>All cash in and cash out transactions</p>
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
              <span style={{ color: r.type === "in" ? "#22c55e" : "#ef4444", fontWeight: 600 }}>
                {r.type === "in" ? "Cash In" : "Cash Out"}
              </span>
            )},
            { key: "description", label: "DESCRIPTION" },
            { key: "category",    label: "CATEGORY" },
            { key: "amount",      label: "AMOUNT", render: r => toRp(r.amount) },
          ]}
          data={paginated}
          emptyMsg={loading ? "Memuat data..." : 'No cash flow records yet. Click "Add Cash In" or "Add Cash Out" to create one.'}
        />
        <PaginationBar page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {showIn  && <CashModal type="in"  />}
      {showOut && <CashModal type="out" />}
    </div>
  );
}