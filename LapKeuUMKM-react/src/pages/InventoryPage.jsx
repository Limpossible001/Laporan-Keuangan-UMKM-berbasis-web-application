import { useState, useEffect } from "react";
import { StatCard, Btn, Table, Modal, Field } from "../components.jsx";
import { useNotif } from "../contexts.jsx";
import { toRp, toQty } from "../components.jsx";  // Note 4: toQty tanpa desimal
import styles from "../styles.js";
import { apiFetch } from "../api.js";

// Note 5: Langkah-langkah form Add Inventory
// Step 1 = isi form  |  Step 2 = konfirmasi (popup review)  |  Step 3 = submit
const EMPTY_FORM = { product_name: "", category: "", unit_price: "", quantity: "", notes: "" };

export default function InventoryPage() {
  const { showNotif } = useNotif();
  const [data, setData]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false); // Note 5: modal konfirmasi
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);

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

  // Tombol "Add Item" di modal form → validasi → tampilkan konfirmasi (Note 5)
  const handleRequestConfirm = () => {
    if (!form.product_name || !form.unit_price || !form.quantity) {
      showNotif("Nama produk, harga satuan, dan kuantitas wajib diisi", "error"); return;
    }
    if (Number(form.unit_price) <= 0) {
      showNotif("Harga satuan harus lebih dari 0", "error"); return;
    }
    if (Number(form.quantity) <= 0) {
      showNotif("Kuantitas awal harus lebih dari 0", "error"); return;
    }
    // Tutup form, buka konfirmasi
    setShowModal(false);
    setShowConfirm(true);
  };

  // Tombol "Ya, Tambahkan" di modal konfirmasi → kirim ke API
  const handleConfirmedAdd = async () => {
    setSaving(true);
    try {
      const payload = {
        product_name: form.product_name,
        category:     form.category,
        unit_price:   Number(form.unit_price),
        quantity:     Number(form.quantity),     // Note 4: integer di payload
        notes:        form.notes,
      };
      const res = await apiFetch("/inventory", { method: "POST", body: JSON.stringify(payload) });
      setData(d => [res, ...d]);
      setForm(EMPTY_FORM);
      setShowConfirm(false);
      showNotif("Item inventory berhasil ditambahkan");
    } catch (e) {
      showNotif(e.message, "error");
      setShowConfirm(false);
    } finally {
      setSaving(false);
    }
  };

  // Batal di konfirmasi → kembali ke form dengan data tetap terisi
  const handleBackToForm = () => {
    setShowConfirm(false);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await apiFetch(`/inventory/${id}`, { method: "DELETE" });
      setData(d => d.filter(x => x.id !== id));
      showNotif("Item berhasil dihapus");
    } catch (e) {
      showNotif(e.message, "error");
    }
  };

  const lowStock   = data.filter(r => Number(r.quantity) < 10).length;
  // Note 4: totalStock ditampilkan pakai toQty (integer)
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
        <StatCard label="TOTAL PRODUCTS"  value={toQty(data.length)}  subtitle="Unique items" />
        <StatCard label="TOTAL STOCK"     value={toQty(totalStock)}   subtitle="Total units" />
        <StatCard label="LOW STOCK ALERT" value={toQty(lowStock)}     subtitle="Items below 10 units" accent />
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
          <Btn onClick={() => { setForm(EMPTY_FORM); setShowModal(true); }}>+ Add Inventory Item</Btn>
        </div>
        <Table
          columns={[
            { key: "product_name", label: "PRODUCT NAME" },
            { key: "category",     label: "CATEGORY"     },
            { key: "unit_price",   label: "UNIT PRICE",   render: r => toRp(r.unit_price)  },
            // Note 4: quantity pakai toQty → tampil tanpa .00
            { key: "quantity",     label: "QUANTITY",     render: r => toQty(r.quantity)   },
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
          emptyMsg={loading ? "Memuat data..." : 'Belum ada item. Klik "Add Inventory Item" untuk menambahkan.'}
        />
      </div>

      {/* ── MODAL FORM (Step 1) ──────────────────────────── */}
      {showModal && (
        <Modal title="Add Inventory Item" onClose={() => setShowModal(false)}>
          <Field
            label="Product Name"
            value={form.product_name} onChange={set("product_name")}
            placeholder="Nama produk" required
          />
          <Field
            label="Category"
            value={form.category} onChange={set("category")}
            placeholder="Kategori produk (opsional)"
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
              min="1" step="1" required
            />
          </div>
          <Field
            label="Notes (Opsional)"
            value={form.notes} onChange={set("notes")}
            placeholder="Catatan tambahan"
          />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn variant="outline" onClick={() => setShowModal(false)}>Cancel</Btn>
            {/* Note 5: tombol ini membuka konfirmasi, bukan langsung submit */}
            <Btn onClick={handleRequestConfirm}>Lanjut →</Btn>
          </div>
        </Modal>
      )}

      {/* ── MODAL KONFIRMASI (Step 2 — Note 5) ─────────── */}
      {showConfirm && (
        <Modal title="✅ Konfirmasi Tambah Item" onClose={handleBackToForm}>
          <p style={{ fontSize: 14, color: "#374151", marginBottom: 16 }}>
            Mohon cek ulang data item inventory yang akan ditambahkan:
          </p>
          <div style={{
            background: "#f9fafb", borderRadius: 8,
            padding: "14px 16px", marginBottom: 20, fontSize: 14,
          }}>
            {[
              ["Nama Produk",  form.product_name],
              ["Kategori",     form.category || "—"],
              ["Harga Satuan", toRp(form.unit_price)],
              // Note 4: quantity konfirmasi juga integer
              ["Kuantitas Awal", toQty(form.quantity) + " unit"],
              ["Total Nilai",  toRp(Number(form.unit_price) * Number(form.quantity))],
              ["Notes",        form.notes || "—"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #e5e7eb" }}>
                <span style={{ color: "#6b7280" }}>{k}</span>
                <span style={{ fontWeight: 600, color: "#111827" }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Btn variant="outline" onClick={handleBackToForm} disabled={saving}>
              ← Kembali Edit
            </Btn>
            <Btn onClick={handleConfirmedAdd} disabled={saving}>
              {saving ? "Menyimpan…" : "Ya, Tambahkan"}
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}