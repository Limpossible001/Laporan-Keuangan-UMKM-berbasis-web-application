import { useState, useEffect } from "react";
import { StatCard, Btn, Table, Modal, Field, SelectField, PaginationBar, usePagination } from "../components.jsx";
import { useNotif } from "../contexts.jsx";
import { toRp, toQty } from "../components.jsx"; // Note 4
import styles from "../styles.js";
import { apiFetch } from "../api.js";

export default function SalesPage() {
  const { showNotif } = useNotif();
  const [data, setData]           = useState([]);
  const { paginated, page, setPage, totalPages } = usePagination(data, 10);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState({
    date: "", inventory_id: "", quantity: "", unit_price: "", customer_notes: ""
  });

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const loadAll = async () => {
    setLoading(true);
    try {
      const [salesRes, inventoryRes] = await Promise.all([
        apiFetch("/sales"),
        apiFetch("/inventory"),
      ]);
      setData(salesRes);
      setInventory(inventoryRes);
    } catch (e) {
      showNotif(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  // Saat item dipilih, auto-isi unit_price dari harga jual di inventory (bisa diedit manual)
  const handleInventoryChange = (e) => {
    const id = e.target.value;
    const item = inventory.find(i => String(i.id) === id);
    setForm(f => ({
      ...f,
      inventory_id: id,
      unit_price: item ? item.unit_price : f.unit_price,
    }));
  };

  const selectedItem = inventory.find(i => String(i.id) === String(form.inventory_id));

  const handleAdd = async () => {
    if (!form.date || !form.inventory_id || !form.quantity || !form.unit_price) {
      showNotif("Field wajib harus diisi", "error"); return;
    }
    if (Number(form.quantity) <= 0) {
      showNotif("Kuantitas harus lebih dari 0", "error"); return;
    }
    if (Number(form.unit_price) <= 0) {
      showNotif("Harga satuan harus lebih dari 0", "error"); return;
    }
    // Validasi stok di sisi FE dulu untuk feedback cepat (BE tetap validasi ulang)
    if (selectedItem && Number(form.quantity) > Number(selectedItem.quantity)) {
      showNotif(`Stok tidak mencukupi. Stok tersedia: ${toQty(selectedItem.quantity)} unit`, "error"); return;
    }

    try {
      const payload = {
        date: form.date,
        inventory_id: Number(form.inventory_id),
        quantity: Number(form.quantity),
        unit_price: Number(form.unit_price),
        total_revenue: Number(form.quantity) * Number(form.unit_price),
        customer_notes: form.customer_notes,
      };
      const res = await apiFetch("/sales", { method: "POST", body: JSON.stringify(payload) });
      setData(d => [res, ...d]);

      // Stok inventory berkurang di BE — refresh agar dropdown & sisa stok akurat
      const freshInventory = await apiFetch("/inventory");
      setInventory(freshInventory);

      setForm({ date: "", inventory_id: "", quantity: "", unit_price: "", customer_notes: "" });
      setShowModal(false);
      showNotif("Data penjualan berhasil ditambahkan");
    } catch (e) {
      showNotif(e.message, "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiFetch(`/sales/${id}`, { method: "DELETE" });
      setData(d => d.filter(x => x.id !== id));
      showNotif("Data berhasil dihapus");
    } catch (e) {
      showNotif(e.message, "error");
    }
  };

  const totalRevenue = data.reduce((s, r) => s + Number(r.total_revenue), 0);
  const totalItems   = data.reduce((s, r) => s + Number(r.quantity), 0);

  // Note 4: toQty → stok tanpa desimal di dropdown label
  const inventoryOptions = inventory.map(i => ({ value: String(i.id), label: `${i.product_name} (stok: ${toQty(i.quantity)})` }));

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
            { key: "date",           label: "DATE" },
            { key: "inventory",      label: "PRODUCT",       render: r => r.inventory?.product_name ?? "—" },
            { key: "quantity",       label: "QTY", render: r => toQty(r.quantity) },
            { key: "unit_price",     label: "UNIT PRICE",    render: r => toRp(r.unit_price) },
            { key: "total_revenue",  label: "TOTAL REVENUE", render: r => toRp(r.total_revenue) },
            { key: "customer_notes", label: "NOTES" },
            { key: "actions", label: "ACTIONS", render: r => (
              <Btn variant="danger" size="sm" onClick={() => handleDelete(r.id)}>Hapus</Btn>
            )},
          ]}
          data={paginated}
          emptyMsg={loading ? "Memuat data..." : 'No sales records yet. Click "Add Sale" to create one.'}
        />
        <PaginationBar page={page} totalPages={totalPages} onPageChange={setPage}/>
      </div>

      {showModal && (
        <Modal title="Add Sale" onClose={() => setShowModal(false)}>
          <Field label="Sale Date" type="date" value={form.date} onChange={set("date")} required />

          {inventory.length === 0 ? (
            <div style={{
              background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8,
              padding: "10px 12px", marginBottom: 14, fontSize: 13, color: "#9a3412",
            }}>
              Belum ada item inventory. Tambahkan item di halaman Input Inventory dulu.
            </div>
          ) : (
            <SelectField
              label="Product" value={form.inventory_id} onChange={handleInventoryChange}
              options={inventoryOptions} required
            />
          )}

          {selectedItem && (
            <p style={{ fontSize: 12, color: "#6b7280", marginTop: -10, marginBottom: 14 }}>
              Stok tersedia: <strong>{toQty(selectedItem.quantity)} unit</strong>
            </p>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field
              label="Quantity Sold" type="number"
              value={form.quantity} onChange={set("quantity")}
              min="0.01" step="0.01" required
            />
            <Field
              label="Unit Price (Rp)" type="number"
              value={form.unit_price} onChange={set("unit_price")}
              min="1" step="1" required
            />
          </div>

          {form.quantity > 0 && form.unit_price > 0 && (
            <div style={{
              background: "#f0fdf4", border: "1px solid #bbf7d0",
              borderRadius: 8, padding: "8px 12px", marginBottom: 14,
              fontSize: 13, color: "#166534",
            }}>
              Total Revenue: <strong>{toRp(Number(form.quantity) * Number(form.unit_price))}</strong>
            </div>
          )}

          <Field
            label="Customer Notes (Optional)"
            value={form.customer_notes} onChange={set("customer_notes")}
            placeholder="Optional notes"
          />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn variant="outline" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn variant="success" onClick={handleAdd}>Add Sale</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}