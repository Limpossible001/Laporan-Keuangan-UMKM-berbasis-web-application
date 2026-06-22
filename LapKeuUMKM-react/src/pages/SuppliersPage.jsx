import { useState, useEffect } from "react";
import { StatCard, Btn, Table, Modal, Field } from "../components.jsx";
import { useNotif } from "../contexts.jsx";
import styles from "../styles.js";
import { apiFetch } from "../api.js";

export default function SuppliersPage() {
  const { showNotif } = useNotif();
  const [data, setData]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm]           = useState({
    name: "", contact_person: "", phone: "", address: "", notes: ""
  });

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/suppliers");
      setData(res);
    } catch (e) {
      showNotif(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const resetForm = () => {
    setForm({ name: "", contact_person: "", phone: "", address: "", notes: "" });
    setEditingId(null);
  };

  const openAdd = () => { resetForm(); setShowModal(true); };

  const openEdit = (supplier) => {
    setForm({
      name: supplier.name ?? "",
      contact_person: supplier.contact_person ?? "",
      phone: supplier.phone ?? "",
      address: supplier.address ?? "",
      notes: supplier.notes ?? "",
    });
    setEditingId(supplier.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name) {
      showNotif("Nama supplier wajib diisi", "error"); return;
    }

    try {
      if (editingId) {
        const res = await apiFetch(`/suppliers/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
        setData(d => d.map(x => (x.id === editingId ? res : x)));
        showNotif("Supplier berhasil diperbarui");
      } else {
        const res = await apiFetch("/suppliers", {
          method: "POST",
          body: JSON.stringify(form),
        });
        setData(d => [res, ...d]);
        showNotif("Supplier berhasil ditambahkan");
      }
      resetForm();
      setShowModal(false);
    } catch (e) {
      showNotif(e.message, "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiFetch(`/suppliers/${id}`, { method: "DELETE" });
      setData(d => d.filter(x => x.id !== id));
      showNotif("Supplier berhasil dihapus");
    } catch (e) {
      showNotif(e.message, "error");
    }
  };

  return (
    <div>
      <h1 style={styles.pageTitle}>Suppliers</h1>
      <div style={styles.statsRow}>
        <StatCard label="TOTAL SUPPLIERS" value={data.length} subtitle="Registered suppliers" />
      </div>

      <div style={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h3 style={styles.cardTitle}>Supplier List</h3>
            <p style={styles.cardSub}>Kelola data supplier untuk pembelian</p>
          </div>
          <Btn onClick={openAdd}>+ Add Supplier</Btn>
        </div>
        <Table
          columns={[
            { key: "name",            label: "NAME" },
            { key: "contact_person",  label: "CONTACT PERSON" },
            { key: "phone",           label: "PHONE" },
            { key: "address",         label: "ADDRESS" },
            { key: "actions", label: "ACTIONS", render: r => (
              <div style={{ display: "flex", gap: 6 }}>
                <Btn variant="outline" size="sm" onClick={() => openEdit(r)}>Edit</Btn>
                <Btn variant="danger" size="sm" onClick={() => handleDelete(r.id)}>Hapus</Btn>
              </div>
            )},
          ]}
          data={data}
          emptyMsg={loading ? "Memuat data..." : 'No suppliers yet. Click "Add Supplier" to create one.'}
        />
      </div>

      {showModal && (
        <Modal title={editingId ? "Edit Supplier" : "Add Supplier"} onClose={() => { setShowModal(false); resetForm(); }}>
          <Field
            label="Supplier Name"
            value={form.name} onChange={set("name")}
            placeholder="Enter supplier name" required
          />
          <Field
            label="Contact Person"
            value={form.contact_person} onChange={set("contact_person")}
            placeholder="Optional"
          />
          <Field
            label="Phone"
            value={form.phone} onChange={set("phone")}
            placeholder="Optional"
          />
          <Field
            label="Address"
            value={form.address} onChange={set("address")}
            placeholder="Optional"
          />
          <Field
            label="Notes"
            value={form.notes} onChange={set("notes")}
            placeholder="Optional"
          />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn variant="outline" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</Btn>
            <Btn onClick={handleSave}>{editingId ? "Save Changes" : "Add Supplier"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}