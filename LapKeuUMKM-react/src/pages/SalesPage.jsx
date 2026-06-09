import { useState } from "react";
import { StatCard, Btn, Table, Modal, Field } from "../components.jsx";
import { useNotif } from "../contexts.jsx";
import { toRp } from "../components.jsx";
import styles from "../styles.js";
// import { apiFetch } from "../api.js"; // TODO C.3

export default function SalesPage() {
  const { showNotif } = useNotif();
  const [data, setData]         = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState({ date: "", product_name: "", quantity: "", unit_price: "", customer_notes: "" });

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleAdd = async () => {
    if (!form.date || !form.product_name || !form.quantity || !form.unit_price) {
      showNotif("Field wajib harus diisi", "error"); return;
    }
    try {
      // TODO C.3: const res = await apiFetch("/sales", { method: "POST", body: JSON.stringify({ ...form, total_revenue: form.quantity * form.unit_price }) });
      // TODO C.3: setData(d => [res, ...d]);
      const newItem = { id: Date.now(), ...form, total_revenue: form.quantity * form.unit_price };
      setData(d => [newItem, ...d]);
      setForm({ date: "", product_name: "", quantity: "", unit_price: "", customer_notes: "" });
      setShowModal(false);
      showNotif("Data penjualan berhasil ditambahkan");
    } catch (e) { showNotif(e.message, "error"); }
  };

  const handleDelete = async (id) => {
    try {
      // TODO C.3: await apiFetch(`/sales/${id}`, { method: "DELETE" });
      setData(d => d.filter(x => x.id !== id));
      showNotif("Data berhasil dihapus");
    } catch (e) { showNotif(e.message, "error"); }
  };

  const totalRevenue = data.reduce((s, r) => s + Number(r.total_revenue), 0);
  const totalItems   = data.reduce((s, r) => s + Number(r.quantity), 0);

  return (
    <div>
      <h1 style={styles.pageTitle}>Input Penjualan</h1>
      <div style={styles.statsRow}>
        <StatCard label="TOTAL SALES"   value={data.length}        subtitle="Total transactions" />
        <StatCard label="TOTAL REVENUE" value={toRp(totalRevenue)} subtitle="All time revenue" />
        <StatCard label="ITEMS SOLD"    value={totalItems}         subtitle="Total units" accent />
      </div>

      <div style={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h3 style={styles.cardTitle}>Sales Records</h3>
            <p style={styles.cardSub}>All sales transactions</p>
          </div>
          <Btn variant="success" onClick={() => setShowModal(true)}>+ Add Sale</Btn>
        </div>
        <Table
          columns={[
            { key: "date",          label: "DATE" },
            { key: "product_name",  label: "PRODUCT" },
            { key: "quantity",      label: "QTY" },
            { key: "unit_price",    label: "UNIT PRICE",    render: r => toRp(r.unit_price) },
            { key: "total_revenue", label: "TOTAL REVENUE", render: r => toRp(r.total_revenue) },
            { key: "customer_notes",label: "NOTES" },
            { key: "actions", label: "ACTIONS", render: r => (
              <Btn variant="danger" size="sm" onClick={() => handleDelete(r.id)}>Hapus</Btn>
            )},
          ]}
          data={data}
          emptyMsg='No sales records yet. Click "Add Sale" to create one.'
        />
      </div>

      {showModal && (
        <Modal title="Add Sale" onClose={() => setShowModal(false)}>
          <Field label="Sale Date" type="date" value={form.date} onChange={set("date")} required />
          <div style={{ marginBottom: 14 }}>
            <label style={styles.fieldLabel}>Product Name <span style={{ color: "#ef4444" }}>*</span></label>
            <input
              value={form.product_name} onChange={set("product_name")}
              placeholder="Enter product name"
              style={styles.input}
              onFocus={e => { e.target.style.borderColor = "#4F46E5"; e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,.12)"; }}
              onBlur={e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }}
            />
            {/* TODO C.3: ganti input bebas dengan <select> yang populate dari /api/inventory */}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Quantity Sold" type="number" value={form.quantity}   onChange={set("quantity")}   required />
            <Field label="Unit Price"    type="number" value={form.unit_price} onChange={set("unit_price")} required />
          </div>
          <Field label="Customer Notes (Optional)" value={form.customer_notes} onChange={set("customer_notes")} placeholder="Optional notes" />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn variant="outline" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn variant="success" onClick={handleAdd}>Add Sale</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}