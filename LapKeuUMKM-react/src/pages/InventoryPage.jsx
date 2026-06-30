import { useState, useEffect } from "react";
import { StatCard, Btn, Table, Modal, Field } from "../components.jsx";
import { useNotif } from "../contexts.jsx";
import { toRp } from "../components.jsx";
import styles from "../styles.js";
import { apiFetch } from "../api.js";

export default function InventoryPage() {
  const { showNotif } = useNotif();
  const [data, setData]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState({
    product_name: "", category: "", unit_price: "", quantity: "", notes: ""
  });

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/inventory");
      setData(res);
    } catch (e) {
      showNotif(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAdd = async () => {
    if (!form.product_name || !form.unit_price || !form.quantity) {
      showNotif("Field wajib harus diisi", "error"); return;
    }
    if (Number(form.unit_price) <= 0) {
      showNotif("Harga satuan harus lebih dari 0", "error"); return;
    }
    if (Number(form.quantity) <= 0) {
      showNotif("Kuantitas awal harus lebih dari 0", "error"); return;
    }
    if (!window.confirm("Silahkan cek kembali data anda, apakah sudah yakin?")) {
      return;
    }

    try {
      const payload = {
        product_name: form.product_name,
        category: form.category,
        unit_price: Number(form.unit_price),
        quantity: Number(form.quantity),
        notes: form.notes,
      };
      const res = await apiFetch("/inventory", { method: "POST", body: JSON.stringify(payload) });
      setData(d => [res, ...d]);
      setForm({ product_name: "", category: "", unit_price: "", quantity: "", notes: "" });
      setShowModal(false);
      showNotif("Item inventory berhasil ditambahkan");
    } catch (e) {
      showNotif(e.message, "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah anda yakin untuk menghapus ini?")) {
      return;
    }
    
    try {
      await apiFetch(`/inventory/${id}`, { method: "DELETE" });
      setData(d => d.filter(x => x.id !== id));
      showNotif("Item berhasil dihapus");
    } catch (e) {
      showNotif(e.message, "error");
    }
  };

  const lowStock   = data.filter(r => Number(r.quantity) < 10).length;
  const totalStock = data.reduce((s, r) => s + Number(r.quantity), 0);
  const totalValue = data.reduce((s, r) => s + Number(r.unit_price) * Number(r.quantity), 0);

  const fmtDate = (val) => {
    if (!val) return "—";
    try { return new Date(val).toLocaleDateString("id-ID"); } catch { return val; }
  };

  return (
    <div>
      <h1 style={styles.pageTitle}>Input Inventory</h1>
      <div style={styles.statsRow}>
        <StatCard label="TOTAL PRODUCTS"  value={data.length}   subtitle="Unique items" />
        <StatCard label="TOTAL STOCK"     value={totalStock}    subtitle="Total units" />
        <StatCard label="LOW STOCK ALERT" value={lowStock}      subtitle="Items below 10 units" accent />
      </div>

      {data.length > 0 && (
        <div style={{
          background: "#eff6ff", border: "1px solid #bfdbfe",
          borderRadius: 10, padding: "10px 16px", marginBottom: 16,
          fontSize: 13, color: "#1e40af",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          📦 Total Nilai Inventory: <strong>{toRp(totalValue)}</strong>
        </div>
      )}

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
            { key: "last_updated", label: "LAST UPDATED", render: r => fmtDate(r.last_updated) },
            { key: "status",       label: "STATUS", render: r => {
              const ok = Number(r.quantity) >= 10;
              return (
                <span style={{ color: ok ? "#22c55e" : "#f59e0b", fontWeight: 600 }}>
                  {ok ? "OK" : "Low"}
                </span>
              );
            }},
            { key: "actions", label: "ACTIONS", render: r => (
              <Btn variant="danger" size="sm" onClick={() => handleDelete(r.id)}>Hapus</Btn>
            )},
          ]}
          data={data}
          emptyMsg={loading ? "Memuat data..." : 'No inventory items yet. Click "Add Inventory Item" to create one.'}
        />
      </div>

      {showModal && (
        <Modal title="Add Inventory Item" onClose={() => setShowModal(false)}>
          <Field
            label="Product Name"
            value={form.product_name} onChange={set("product_name")}
            placeholder="Enter product name" required
          />
          <Field
            label="Category"
            value={form.category} onChange={set("category")}
            placeholder="Enter category"
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field
              label="Unit Price (Rp)" type="number"
              value={form.unit_price} onChange={set("unit_price")}
              min="1" step="1" required
            />
            <Field
              label="Initial Quantity" type="number"
              value={form.quantity} onChange={set("quantity")}
              min="0.01" step="0.01" required
            />
          </div>
          <Field
            label="Notes (Optional)"
            value={form.notes} onChange={set("notes")}
            placeholder="Optional notes"
          />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn variant="outline" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn onClick={handleAdd}>Add Item</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}