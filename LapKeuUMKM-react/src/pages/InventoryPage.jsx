import { useState, useEffect } from "react";
import { StatCard, Btn, Table, Modal, Field, PaginationBar, usePagination } from "../components.jsx";
import { useNotif } from "../contexts.jsx";
import { toRp, toQty } from "../components.jsx";
import styles from "../styles.js";
import { apiFetch } from "../api.js";

// Add Inventory = pendataan saja. Tidak ada unit_price / quantity di sini —
// keduanya hanya diisi lewat Add Purchase (Input Pembelian).
const EMPTY_FORM = {
  item_id: "",
  product_name: "",
  category: "",
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

  // Deteksi ID item yang sudah dipakai (bukan restock — hanya untuk validasi
  // & peringatan; penambahan stok/nilai untuk item existing HARUS lewat
  // Input Pembelian, bukan dari sini).
  const [duplicateItem, setDuplicateItem] = useState(null);

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

  // Saat item_id berubah, cek ke data lokal apakah ID ini sudah dipakai.
  // Kalau sudah, tampilkan peringatan — tidak ada auto-fill/restock, user
  // harus pakai ID lain atau pergi ke Input Pembelian untuk item tsb.
  const handleItemIdChange = (e) => {
    const val = e.target.value;
    const found = data.find(d => String(d.item_id) === String(val));
    setDuplicateItem(val && found ? found : null);
    setForm(f => ({ ...f, item_id: val }));
  };

  const handleRequestConfirm = () => {
    if (!form.item_id || isNaN(Number(form.item_id)) || Number(form.item_id) < 1) {
      showNotif("ID Item harus berupa angka positif", "error"); return;
    }
    if (duplicateItem) {
      showNotif(`ID Item ${form.item_id} sudah dipakai untuk "${duplicateItem.product_name}". Gunakan ID lain.`, "error");
      return;
    }
    if (!form.product_name) { showNotif("Nama produk wajib diisi", "error"); return; }
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
        notes:        form.notes,
      };
      const res = await apiFetch("/inventory", { method: "POST", body: JSON.stringify(payload) });
      const { item, message } = res;

      setData(d => [...d, item]);
      setForm(EMPTY_FORM);
      setDuplicateItem(null);
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

  return (
    <div>
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
          <Btn onClick={() => { setForm(EMPTY_FORM); setDuplicateItem(null); setShowModal(true); }}>
            + Add Inventory Item
          </Btn>
        </div>
        <Table
          columns={[
            { key: "item_id",      label: "ID ITEM",      render: r => <strong>{r.item_id}</strong> },
            { key: "product_name", label: "NAMA PRODUK" },
            { key: "category",     label: "KATEGORI",     render: r => r.category || "—" },
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

      {/* ── MODAL FORM (Step 1) ──
          Add Inventory = pendataan saja: ID Item, Product Name, Category, Notes.
          Tidak ada unit_price / quantity — dan tidak ada mode restock di sini.
          Untuk menambah stok item yang sudah ada, arahkan ke Input Pembelian. */}
      {showModal && (
        <Modal title="Add Inventory Item" onClose={() => { setShowModal(false); setDuplicateItem(null); }}>
          <div style={{ marginBottom: 14 }}>
            <label style={styles.fieldLabel}>
              ID Item <span style={{ color:"#ef4444" }}>*</span>
            </label>
            <input
              type="number" min="1" step="1"
              value={form.item_id}
              onChange={handleItemIdChange}
              placeholder="Ketik ID item (cth: 1, 2, 3...)"
              style={{ ...styles.input, borderColor: duplicateItem ? "#ef4444" : undefined }}
            />
            {duplicateItem && (
              <p style={{ fontSize: 12, color: "#b91c1c", marginTop: 4, marginBottom: 0 }}>
                ⚠️ ID {form.item_id} sudah dipakai untuk <strong>{duplicateItem.product_name}</strong>.
                Gunakan ID lain, atau tambah stok item ini lewat menu Input Pembelian.
              </p>
            )}
            {form.item_id && !duplicateItem && (
              <p style={{ fontSize: 12, color: "#16a34a", marginTop: 4, marginBottom: 0 }}>
                ✨ ID baru — item ini akan didata sebagai produk baru.
              </p>
            )}
          </div>

          <Field label="Product Name" value={form.product_name} onChange={set("product_name")} placeholder="Nama produk" required />
          <Field label="Category" value={form.category} onChange={set("category")} placeholder="Kategori (opsional)" />
          <Field label="Notes (Opsional)" value={form.notes} onChange={set("notes")} placeholder="Catatan tambahan" />

          <div style={{ background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:8, padding:"10px 12px",
            marginBottom:14, fontSize:12, color:"#1e40af" }}>
            ℹ️ Stok & harga satuan diisi lewat menu <strong>Input Pembelian</strong> setelah item ini didata.
          </div>

          <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:8 }}>
            <Btn variant="outline" onClick={() => { setShowModal(false); setDuplicateItem(null); }}>Batal</Btn>
            <Btn onClick={handleRequestConfirm}>Lanjut →</Btn>
          </div>
        </Modal>
      )}

      {/* ── MODAL KONFIRMASI (Step 2) ── */}
      {showConfirm && (
        <Modal title="✅ Konfirmasi Item Baru" onClose={handleBackToForm}>
          <p style={{ fontSize:14, color:"#374151", marginBottom:16 }}>
            Cek ulang item baru yang akan didata:
          </p>
          <div style={{ background:"#f9fafb", borderRadius:8, padding:"14px 16px", marginBottom:20, fontSize:14 }}>
            {[
              ["ID Item",     form.item_id],
              ["Nama Produk", form.product_name],
              ["Kategori",    form.category || "—"],
              ["Notes",       form.notes || "—"],
            ].map(([k, v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"4px 0", borderBottom:"1px solid #e5e7eb" }}>
                <span style={{ color:"#6b7280" }}>{k}</span>
                <span style={{ fontWeight:600, color:"#111827" }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <Btn variant="outline" onClick={handleBackToForm} disabled={saving}>← Kembali Edit</Btn>
            <Btn onClick={handleConfirmedAdd} disabled={saving}>
              {saving ? "Menyimpan…" : "Ya, Tambahkan"}
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}