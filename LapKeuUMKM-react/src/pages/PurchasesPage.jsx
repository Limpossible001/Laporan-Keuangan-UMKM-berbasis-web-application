import { useState } from "react";
import { StatCard, Btn, Table, Modal, Field } from "../components.jsx";
import { useNotif } from "../contexts.jsx";
import { toRp } from "../components.jsx";
import styles from "../styles.js";
// import { apiFetch } from "../api.js"; // TODO C.1

export default function PurchasesPage() {
  const { showNotif } = useNotif();
  const [data, setData]           = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState({
    date: "", supplier_name: "", item_name: "", quantity: "", unit_price: ""
  });

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleAdd = async () => {
    // ── Validasi wajib isi ──────────────────────────────────
    if (!form.date || !form.supplier_name || !form.item_name || !form.quantity || !form.unit_price) {
      showNotif("Semua field wajib diisi", "error"); return;
    }
    // ── Validasi nilai > 0 (tidak boleh 0 atau minus) ───────
    if (Number(form.quantity) <= 0) {
      showNotif("Kuantitas harus lebih dari 0", "error"); return;
    }
    if (Number(form.unit_price) <= 0) {
      showNotif("Harga satuan harus lebih dari 0", "error"); return;
    }

    try {
      // TODO C.1: const res = await apiFetch("/purchases", { method: "POST", body: JSON.stringify({ ...form, total_amount: form.quantity * form.unit_price }) });
      // TODO C.1: setData(d => [res, ...d]);
      const newItem = {
        id: Date.now(),
        ...form,
        total_amount: Number(form.quantity) * Number(form.unit_price),
      };
      setData(d => [newItem, ...d]);
      setForm({ date: "", supplier_name: "", item_name: "", quantity: "", unit_price: "" });
      setShowModal(false);
      showNotif("Data pembelian berhasil ditambahkan");
    } catch (e) { showNotif(e.message, "error"); }
  };

  const handleDelete = async (id) => {
    try {
      // TODO C.1: await apiFetch(`/purchases/${id}`, { method: "DELETE" });
      setData(d => d.filter(x => x.id !== id));
      showNotif("Data berhasil dihapus");
    } catch (e) { showNotif(e.message, "error"); }
  };

  const totalAmount = data.reduce((s, r) => s + Number(r.total_amount), 0);
  const avgPurchase = data.length ? totalAmount / data.length : 0;

  return (
    <div>
      <h1 style={styles.pageTitle}>Input Pembelian</h1>
      <div style={styles.statsRow}>
        <StatCard label="TOTAL PURCHASES"  value={data.length}       subtitle="Total records" />
        <StatCard label="TOTAL AMOUNT"     value={toRp(totalAmount)} subtitle="All time purchases" />
        <StatCard label="AVERAGE PURCHASE" value={toRp(avgPurchase)} subtitle="Per transaction" accent />
      </div>

      <div style={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h3 style={styles.cardTitle}>Purchase Records</h3>
            <p style={styles.cardSub}>All purchase transactions</p>
          </div>
          <Btn onClick={() => setShowModal(true)}>+ Add Purchase</Btn>
        </div>
        <Table
          columns={[
            { key: "date",          label: "DATE" },
            { key: "supplier_name", label: "SUPPLIER" },
            { key: "item_name",     label: "ITEM" },
            { key: "quantity",      label: "QTY" },
            { key: "unit_price",    label: "UNIT PRICE",  render: r => toRp(r.unit_price) },
            { key: "total_amount",  label: "TOTAL",       render: r => toRp(r.total_amount) },
            { key: "actions", label: "ACTIONS", render: r => (
              <Btn variant="danger" size="sm" onClick={() => handleDelete(r.id)}>Hapus</Btn>
            )},
          ]}
          data={data}
          emptyMsg='No purchase records yet. Click "Add Purchase" to create one.'
        />
      </div>

      {showModal && (
        <Modal title="Add Purchase" onClose={() => setShowModal(false)}>
          <Field
            label="Transaction Date" type="date"
            value={form.date} onChange={set("date")} required
          />
          <Field
            label="Supplier Name"
            value={form.supplier_name} onChange={set("supplier_name")}
            placeholder="Enter supplier name" required
          />
          <Field
            label="Item Name"
            value={form.item_name} onChange={set("item_name")}
            placeholder="Enter item name" required
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field
              label="Quantity" type="number"
              value={form.quantity} onChange={set("quantity")}
              min="0.01" step="0.01" required
            />
            <Field
              label="Unit Price (Rp)" type="number"
              value={form.unit_price} onChange={set("unit_price")}
              min="1" step="1" required
            />
          </div>
          {/* Preview total real-time */}
          {form.quantity > 0 && form.unit_price > 0 && (
            <div style={{
              background: "#f0fdf4", border: "1px solid #bbf7d0",
              borderRadius: 8, padding: "8px 12px", marginBottom: 14,
              fontSize: 13, color: "#166534",
            }}>
              Total: <strong>{toRp(Number(form.quantity) * Number(form.unit_price))}</strong>
            </div>
          )}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn variant="outline" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn onClick={handleAdd}>Add Purchase</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
