import { useState, useEffect } from "react";
import { StatCard, Btn, Table, Modal, Field, PaginationBar, usePagination } from "../components.jsx";
import { useNotif } from "../contexts.jsx";
import { toRp, toQty } from "../components.jsx";
import styles from "../styles.js";
import { apiFetch } from "../api.js";

const EMPTY_FORM = {
  item_id: "",
  product_name: "",
  category: "",
  unit_price: "",
  quantity: "",
  notes: "",
};

export default function InventoryPage() {
  const { showNotif } = useNotif();
  const [data, setData]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showModal, setShowModal]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving]           = useState(false);
  const [form, setForm]               = useState(EMPTY_FORM);

  // Input 4: deteksi apakah item_id yang diketik sudah ada
  const [existingItem, setExistingItem] = useState(null); // record yang ditemukan

  // Pagination (Input 5)
  const { paginated, page, setPage, totalPages } = usePagination(data, 10);

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

  // Input 4: saat item_id berubah, cari di data lokal (sudah di-fetch)
  const handleItemIdChange = (e) => {
    const val = e.target.value;
    setForm(f => ({ ...f, item_id: val }));
    if (!val) { setExistingItem(null); return; }
    const found = data.find(d => String(d.item_id) === String(val));
    if (found) {
      setExistingItem(found);
      // Auto-fill nama + kategori dari yang sudah ada (read-only saat upsert)
      setForm(f => ({
        ...f,
        item_id:      val,
        product_name: found.product_name,
        category:     found.category ?? "",
        unit_price:   String(found.unit_price),
        quantity:     "",  // quantity tetap diisi user (tambah stok)
        notes:        found.notes ?? "",
      }));
    } else {
      setExistingItem(null);
      // Kosongkan nama + lainnya agar user isi sendiri
      setForm(f => ({ ...f, item_id: val, product_name: "", category: "", unit_price: "", quantity: "", notes: "" }));
    }
  };

  const handleRequestConfirm = () => {
    if (!form.item_id || isNaN(Number(form.item_id)) || Number(form.item_id) < 1) {
      showNotif("ID Item harus berupa angka positif", "error"); return;
    }
    if (!form.product_name) { showNotif("Nama produk wajib diisi", "error"); return; }
    if (!form.unit_price || Number(form.unit_price) <= 0) {
      showNotif("Harga satuan harus lebih dari 0", "error"); return;
    }
    if (!form.quantity || Number(form.quantity) < 1) {
      showNotif("Kuantitas harus minimal 1", "error"); return;
    }
    setShowModal(false);
    setShowConfirm(true);
  };

  const handleConfirmedAdd = async () => {
    setSaving(true);
    try {
      const payload = {
        item_id:      Number(form.item_id),
        product_name: form.product_name,
        category:     form.category,
        unit_price:   Number(form.unit_price),
        quantity:     Number(form.quantity),
        notes:        form.notes,
      };
      const res = await apiFetch("/inventory", { method: "POST", body: JSON.stringify(payload) });
      const { item, action, message } = res;

      if (action === "updated") {
        setData(d => d.map(x => (x.id === item.id ? item : x)));
      } else {
        setData(d => [...d, item]);
      }
      setForm(EMPTY_FORM);
      setExistingItem(null);
      setShowConfirm(false);
      showNotif(message);
    } catch (e) {
      showNotif(e.message, "error");
      setShowConfirm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleBackToForm = () => { setShowConfirm(false); setShowModal(true); };

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
  const totalStock = data.reduce((s, r) => s + Number(r.quantity), 0);
  const totalValue = data.reduce((s, r) => s + Number(r.unit_price) * Number(r.quantity), 0);

  const isRestock = !!existingItem; // Input 4: mode restock vs. item baru

  return (
    <div>
      <h1 style={styles.pageTitle}>Input Inventory</h1>
      <div style={styles.statsRow}>
        <StatCard label="TOTAL PRODUK"    value={toQty(data.length)}  subtitle="Item unik" />
        <StatCard label="TOTAL STOK"      value={toQty(totalStock)}   subtitle="Total unit" />
        <StatCard label="STOK MENIPIS"    value={toQty(lowStock)}     subtitle="Di bawah 10 unit" accent />
      </div>

      {data.length > 0 && (
        <div style={{ background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:10,
          padding:"10px 16px", marginBottom:16, fontSize:13, color:"#1e40af",
          display:"flex", alignItems:"center", gap:8 }}>
          📦 Total Nilai Inventory: <strong>{toRp(totalValue)}</strong>
        </div>
      )}

      <div style={styles.card}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div>
            <h3 style={styles.cardTitle}>Inventory List</h3>
            <p style={styles.cardSub}>Kelola stok produk</p>
          </div>
          <Btn onClick={() => { setForm(EMPTY_FORM); setExistingItem(null); setShowModal(true); }}>
            + Add Inventory Item
          </Btn>
        </div>
        <Table
          columns={[
            { key: "item_id",      label: "ID ITEM",      render: r => <strong>{r.item_id}</strong> },
            { key: "product_name", label: "NAMA PRODUK" },
            { key: "category",     label: "KATEGORI",     render: r => r.category || "—" },
            { key: "unit_price",   label: "HARGA SATUAN", render: r => toRp(r.unit_price) },
            { key: "quantity",     label: "STOK",         render: r => toQty(r.quantity) },
            { key: "status",       label: "STATUS", render: r => {
              const ok = Number(r.quantity) >= 10;
              return <span style={{ color: ok ? "#22c55e" : "#f59e0b", fontWeight:600 }}>{ok ? "OK" : "Low"}</span>;
            }},
          ]}
          data={paginated}
          emptyMsg={loading ? "Memuat data..." : 'Belum ada item.'}
        />
        <PaginationBar page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* ── MODAL FORM (Step 1) ── */}
      {showModal && (
        <Modal title="Add / Restock Inventory Item" onClose={() => { setShowModal(false); setExistingItem(null); }}>
          {/* Input 4: field item_id — ketik angka, auto-detect existing */}
          <div style={{ marginBottom: 14 }}>
            <label style={styles.fieldLabel}>
              ID Item <span style={{ color:"#ef4444" }}>*</span>
              {isRestock && (
                <span style={{ marginLeft:8, fontSize:11, color:"#f59e0b", fontWeight:600, background:"#fefce8",
                  border:"1px solid #fde68a", borderRadius:4, padding:"1px 6px" }}>
                  ⟳ MODE RESTOCK
                </span>
              )}
            </label>
            <input
              type="number" min="1" step="1"
              value={form.item_id}
              onChange={handleItemIdChange}
              placeholder="Ketik ID item (cth: 1, 2, 3...)"
              style={{ ...styles.input, borderColor: isRestock ? "#f59e0b" : undefined }}
            />
            {isRestock && (
              <p style={{ fontSize: 12, color: "#92400e", marginTop: 4, marginBottom: 0 }}>
                🔍 ID {form.item_id} sudah ada: <strong>{existingItem.product_name}</strong> (stok saat ini: {toQty(existingItem.quantity)} unit).
                Isi kuantitas di bawah untuk menambah stok.
              </p>
            )}
            {form.item_id && !isRestock && (
              <p style={{ fontSize: 12, color: "#16a34a", marginTop: 4, marginBottom: 0 }}>
                ✨ ID baru — item ini akan dibuat sebagai produk baru.
              </p>
            )}
          </div>

          {/* Nama produk: read-only saat restock, editable saat baru */}
          <div style={{ marginBottom: 14 }}>
            <label style={styles.fieldLabel}>
              Product Name <span style={{ color:"#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              value={form.product_name}
              onChange={isRestock ? undefined : set("product_name")}
              readOnly={isRestock}
              placeholder={isRestock ? "" : "Nama produk"}
              style={{ ...styles.input, background: isRestock ? "#f3f4f6" : "#fff", cursor: isRestock ? "not-allowed" : "text" }}
            />
          </div>

          {!isRestock && (
            <>
              <Field label="Category" value={form.category} onChange={set("category")} placeholder="Kategori (opsional)" />
              <Field label="Unit Price (Rp)" type="number" value={form.unit_price} onChange={set("unit_price")} min="1" step="1" required />
            </>
          )}

          {isRestock && (
            <div style={{ background:"#f9fafb", borderRadius:8, padding:"10px 14px", marginBottom:14, fontSize:13 }}>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ color:"#6b7280" }}>Kategori</span>
                <span>{existingItem.category || "—"}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
                <span style={{ color:"#6b7280" }}>Harga Satuan</span>
                <span>{toRp(existingItem.unit_price)}</span>
              </div>
            </div>
          )}

          <Field
            label={isRestock ? "Tambah Stok (unit)" : "Initial Quantity"}
            type="number" value={form.quantity} onChange={set("quantity")} min="1" step="1" required
          />
          <Field label="Notes (Opsional)" value={form.notes} onChange={set("notes")} placeholder="Catatan tambahan" />

          <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:8 }}>
            <Btn variant="outline" onClick={() => { setShowModal(false); setExistingItem(null); }}>Batal</Btn>
            <Btn onClick={handleRequestConfirm}>
              {isRestock ? "Restock →" : "Lanjut →"}
            </Btn>
          </div>
        </Modal>
      )}

      {/* ── MODAL KONFIRMASI (Step 2) ── */}
      {showConfirm && (
        <Modal
          title={isRestock ? "✅ Konfirmasi Tambah Stok" : "✅ Konfirmasi Item Baru"}
          onClose={handleBackToForm}
        >
          <p style={{ fontSize:14, color:"#374151", marginBottom:16 }}>
            {isRestock
              ? `Stok "${existingItem?.product_name}" akan ditambah. Pastikan sudah benar:`
              : "Cek ulang item baru yang akan ditambahkan:"}
          </p>
          <div style={{ background:"#f9fafb", borderRadius:8, padding:"14px 16px", marginBottom:20, fontSize:14 }}>
            {[
              ["ID Item",       form.item_id],
              ["Nama Produk",   form.product_name],
              ["Kategori",      form.category || "—"],
              ["Harga Satuan",  toRp(form.unit_price)],
              isRestock
                ? ["Stok Saat Ini", toQty(existingItem?.quantity) + " unit"]
                : null,
              [isRestock ? "Tambah Stok" : "Kuantitas Awal", toQty(form.quantity) + " unit"],
              isRestock
                ? ["Stok Setelah", toQty(Number(existingItem?.quantity) + Number(form.quantity)) + " unit"]
                : ["Total Nilai",  toRp(Number(form.unit_price) * Number(form.quantity))],
            ].filter(Boolean).map(([k, v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"4px 0", borderBottom:"1px solid #e5e7eb" }}>
                <span style={{ color:"#6b7280" }}>{k}</span>
                <span style={{ fontWeight:600, color:"#111827" }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <Btn variant="outline" onClick={handleBackToForm} disabled={saving}>← Kembali Edit</Btn>
            <Btn onClick={handleConfirmedAdd} disabled={saving}>
              {saving ? "Menyimpan…" : isRestock ? "Ya, Tambah Stok" : "Ya, Tambahkan"}
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}