import { useState, useEffect } from "react";
import { StatCard, Btn, Table, Modal, Field, SelectField, PhoneField, PaginationBar, usePagination } from "../components.jsx";
import { useNotif } from "../contexts.jsx";
import { toRp, toQty, fmtDate } from "../components.jsx";
import styles from "../styles.js";
import { apiFetch } from "../api.js";

export default function PurchasesPage() {
  const { showNotif } = useNotif();
  const [data, setData]               = useState([]);
  const { paginated, page, setPage, totalPages } = usePagination(data, 10);
  const [suppliers, setSuppliers]     = useState([]);
  const [inventory, setInventory]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showModal, setShowModal]     = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);

  const [form, setForm] = useState({
    date: "", supplier_id: "", inventory_id: "", quantity: "", unit_price: ""
  });
  const [supplierForm, setSupplierForm] = useState({
    name: "", contact_person: "", phone: "", address: "", notes: ""
  });

  const set         = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const setSupplier = k => e => setSupplierForm(f => ({ ...f, [k]: e.target.value }));

  // ── Load semua data yang dibutuhkan halaman ini ──────────
  const loadAll = async () => {
    setLoading(true);
    try {
      const [purchasesRes, suppliersRes, inventoryRes] = await Promise.all([
        apiFetch("/purchases"),
        apiFetch("/suppliers"),
        apiFetch("/inventory"),
      ]);
      setData(purchasesRes);
      setSuppliers(suppliersRes);
      setInventory(inventoryRes);
    } catch (e) {
      showNotif(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  // ── Submit form Purchase ─────────────────────────────────
  const handleAdd = async () => {
    if (!form.date || !form.supplier_id || !form.inventory_id || !form.quantity || !form.unit_price) {
      showNotif("Semua field wajib diisi", "error"); return;
    }
    if (Number(form.quantity) <= 0) {
      showNotif("Kuantitas harus lebih dari 0", "error"); return;
    }
    if (Number(form.unit_price) <= 0) {
      showNotif("Harga satuan harus lebih dari 0", "error"); return;
    }

    try {
      const payload = {
        date: form.date,
        supplier_id: Number(form.supplier_id),
        inventory_id: Number(form.inventory_id),
        quantity: Number(form.quantity),
        unit_price: Number(form.unit_price),
        total_amount: Number(form.quantity) * Number(form.unit_price),
      };
      const res = await apiFetch("/purchases", { method: "POST", body: JSON.stringify(payload) });
      setData(d => [res, ...d]);

      // Stok inventory bertambah di BE — refresh data inventory lokal biar dropdown & qty akurat
      const freshInventory = await apiFetch("/inventory");
      setInventory(freshInventory);

      setForm({ date: "", supplier_id: "", inventory_id: "", quantity: "", unit_price: "" });
      setShowModal(false);
      showNotif("Data pembelian berhasil ditambahkan");
    } catch (e) {
      showNotif(e.message, "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiFetch(`/purchases/${id}`, { method: "DELETE" });
      setData(d => d.filter(x => x.id !== id));
      showNotif("Data berhasil dihapus");
    } catch (e) {
      showNotif(e.message, "error");
    }
  };

  // ── Submit modal cepat "+Add Supplier" ───────────────────
  const handleAddSupplier = async () => {
    // Note 1: semua 4 field wajib, konsisten dengan SuppliersPage
    if (!supplierForm.name)           { showNotif("Nama supplier wajib diisi", "error");   return; }
    if (!supplierForm.contact_person) { showNotif("Contact person wajib diisi", "error");  return; }
    if (!supplierForm.phone)          { showNotif("Nomor telepon wajib diisi", "error");    return; }
    if (!supplierForm.address)        { showNotif("Alamat wajib diisi", "error");            return; }
    const phoneRegex = /^\+[1-9]\d{7,14}$/;
    if (!phoneRegex.test(supplierForm.phone)) {
      showNotif("Format telepon tidak valid (kode negara + digit)", "error"); return;
    }
    try {
      const res = await apiFetch("/suppliers", { method: "POST", body: JSON.stringify(supplierForm) });
      setSuppliers(s => [res, ...s]);
      // Langsung pilih supplier yang baru dibuat di form Purchase (kalau modalnya sedang terbuka)
      setForm(f => ({ ...f, supplier_id: String(res.id) }));
      setSupplierForm({ name: "", contact_person: "", phone: "", address: "", notes: "" });
      setShowSupplierModal(false);
      showNotif("Supplier berhasil ditambahkan, langsung terpilih di form");
    } catch (e) {
      showNotif(e.message, "error");
    }
  };

  const totalAmount = data.reduce((s, r) => s + Number(r.total_amount), 0);
  const avgPurchase = data.length ? totalAmount / data.length : 0;

  const supplierOptions  = suppliers.map(s => ({ value: String(s.id), label: s.name }));
  // Note 4: toQty → stok tanpa desimal di dropdown label
  const inventoryOptions = inventory.map(i => ({ value: String(i.id), label: `${i.product_name} (stok: ${toQty(i.quantity)})` }));

  return (
    <div>
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
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="outline" onClick={() => setShowSupplierModal(true)}>+ Add Supplier</Btn>
            <Btn onClick={() => setShowModal(true)}>+ Add Purchase</Btn>
          </div>
        </div>
        <Table
          columns={[
            { key: "date",          label: "DATE",        render: r => fmtDate(r.date) },
            { key: "supplier",      label: "SUPPLIER",    render: r => r.supplier?.name ?? "—" },
            { key: "inventory",     label: "ITEM",        render: r => r.inventory?.product_name ?? "—" },
            { key: "quantity",      label: "QTY",         render: r => toQty(r.quantity) },
            { key: "unit_price",    label: "UNIT PRICE",  render: r => toRp(r.unit_price) },
            { key: "total_amount",  label: "TOTAL",       render: r => toRp(r.total_amount) },
          ]}
          data={paginated}
          emptyMsg={loading ? "Memuat data..." : 'No purchase records yet. Click "Add Purchase" to create one.'}
        />
        <PaginationBar page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Modal: Add Purchase */}
      {showModal && (
        <Modal title="Add Purchase" onClose={() => setShowModal(false)}>
          <Field label="Transaction Date" type="date" value={form.date} onChange={set("date")} required />

          {suppliers.length === 0 ? (
            <div style={{
              background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8,
              padding: "10px 12px", marginBottom: 14, fontSize: 13, color: "#9a3412",
            }}>
              Belum ada supplier. Klik "+ Add Supplier" dulu sebelum mencatat pembelian.
            </div>
          ) : (
            <SelectField
              label="Supplier" value={form.supplier_id} onChange={set("supplier_id")}
              options={supplierOptions} required
            />
          )}

          {inventory.length === 0 ? (
            <div style={{
              background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8,
              padding: "10px 12px", marginBottom: 14, fontSize: 13, color: "#9a3412",
            }}>
              Belum ada item inventory. Tambahkan item di halaman Input Inventory dulu.
            </div>
          ) : (
            <SelectField
              label="Item" value={form.inventory_id} onChange={set("inventory_id")}
              options={inventoryOptions} required
            />
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Quantity"   type="number" value={form.quantity}   onChange={set("quantity")}   min="0.01" step="0.01" required />
            <Field label="Unit Price" type="number" value={form.unit_price} onChange={set("unit_price")} min="1" step="1" required />
          </div>

          {form.quantity > 0 && form.unit_price > 0 && (
            <div style={{
              background: "#eff6ff", border: "1px solid #bfdbfe",
              borderRadius: 8, padding: "8px 12px", marginBottom: 14,
              fontSize: 13, color: "#1e40af",
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

      {/* Modal: Add Supplier (cepat, tanpa pindah halaman) */}
      {showSupplierModal && (
        <Modal title="Add Supplier" onClose={() => setShowSupplierModal(false)}>
          <Field
            label="Supplier Name"
            value={supplierForm.name} onChange={setSupplier("name")}
            placeholder="Enter supplier name" required
          />
          <Field
            label="Contact Person"
            value={supplierForm.contact_person} onChange={setSupplier("contact_person")}
            placeholder="Nama penanggung jawab"
            required
          />
          <PhoneField
            label="Phone"
            value={supplierForm.phone}
            onChange={(fullPhone) => setSupplierForm(f => ({ ...f, phone: fullPhone }))}
            required
          />
          <Field
            label="Address"
            value={supplierForm.address} onChange={setSupplier("address")}
            placeholder="Alamat lengkap supplier"
            required
          />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn variant="outline" onClick={() => setShowSupplierModal(false)}>Cancel</Btn>
            <Btn onClick={handleAddSupplier}>Add Supplier</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}