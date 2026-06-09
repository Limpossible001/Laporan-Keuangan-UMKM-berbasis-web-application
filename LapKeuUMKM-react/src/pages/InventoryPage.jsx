import { useState } from "react";
import { StatCard, Btn, Table, Modal, Field } from "../components.jsx";
import { useNotif } from "../contexts.jsx";
import { toRp } from "../components.jsx";
import styles from "../styles.js";
// import { apiFetch } from "../api.js"; // TODO C.2

export default function InventoryPage() {
  const { showNotif } = useNotif();
  const [data, setData]         = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState({ product_name: "", category: "", unit_price: "", quantity: "", notes: "" });

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleAdd = async () => {
    if (!form.product_name || !form.unit_price || !form.quantity) {
      showNotif("Field wajib harus diisi", "error"); return;
    }
    try {
      // TODO C.2: const res = await apiFetch("/inventory", { method: "POST", body: JSON.stringify(form) });
      // TODO C.2: setData(d => [res, ...d]);
      const newItem = {
        id: Date.now(), ...form,
        last_updated: new Date().toLocaleDateString("id-ID"),
        status: Number(form.quantity) > 10 ? "OK" : "Low",
      };
      setData(d => [newItem, ...d]);
      setForm({ product_name: "", category: "", unit_price: "", quantity: "", notes: "" });
      setShowModal(false);
      showNotif("Item inventory berhasil ditambahkan");
    } catch (e) { showNotif(e.message, "error"); }
  };

  const handleDelete = async (id) => {
    try {
      // TODO C.2: await apiFetch(`/inventory/${id}`, { method: "DELETE" });
      setData(d => d.filter(x => x.id !== id));
      showNotif("Item berhasil dihapus");
    } catch (e) { showNotif(e.message, "error"); }
  };

  const lowStock = data.filter(r => Number(r.quantity) < 10).length;

  return (
    <div>
      <h1 style={styles.pageTitle}>Input Inventory</h1>
      <div style={styles.statsRow}>
        <StatCard label="TOTAL PRODUCTS"  value={data.length}                                    subtitle="Unique items" />
        <StatCard label="TOTAL STOCK"     value={data.reduce((s, r) => s + Number(r.quantity), 0)} subtitle="Total units" />
        <StatCard label="LOW STOCK ALERT" value={lowStock}                                        subtitle="Items below 10 units" accent />
      </div>

      <div style={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h3 style={styles.cardTitle}>Inventory List</h3>
            <p style={styles.cardSub}>Manage your product stock</p>
          </div>
          <Btn onClick={() => setShowModal(true)}>+ Add Inventory Item</Btn>
        </div>
        <Table
          columns={[
            { key: "product_name", label: "PRODUCT NAME" },
            { key: "category",     label: "CATEGORY" },
            { key: "unit_price",   label: "UNIT PRICE",   render: r => toRp(r.unit_price) },
            { key: "quantity",     label: "QUANTITY" },
            { key: "last_updated", label: "LAST UPDATED" },
            { key: "status",       label: "STATUS", render: r => (
              <span style={{ color: r.status === "OK" ? "#22c55e" : "#f59e0b", fontWeight: 600 }}>{r.status}</span>
            )},
            { key: "actions", label: "ACTIONS", render: r => (
              <Btn variant="danger" size="sm" onClick={() => handleDelete(r.id)}>Hapus</Btn>
            )},
          ]}
          data={data}
          emptyMsg='No inventory items yet. Click "Add Inventory Item" to create one.'
        />
      </div>

      {showModal && (
        <Modal title="Add Inventory Item" onClose={() => setShowModal(false)}>
          <Field label="Product Name" value={form.product_name} onChange={set("product_name")} placeholder="Enter product name" required />
          <Field label="Category"     value={form.category}     onChange={set("category")}     placeholder="Enter category" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Unit Price"       type="number" value={form.unit_price} onChange={set("unit_price")} required />
            <Field label="Initial Quantity" type="number" value={form.quantity}   onChange={set("quantity")}   required />
          </div>
          <Field label="Notes (Optional)" value={form.notes} onChange={set("notes")} placeholder="Optional notes" />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn variant="outline" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn onClick={handleAdd}>Add Item</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}