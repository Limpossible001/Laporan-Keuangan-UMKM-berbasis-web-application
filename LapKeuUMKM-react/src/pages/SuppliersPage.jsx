import { useState, useEffect } from "react";
import { StatCard, Btn, Table, Modal, Field, PhoneField, PaginationBar, usePagination } from "../components.jsx";
import { useNotif } from "../contexts.jsx";
import styles from "../styles.js";
import { apiFetch } from "../api.js";

export default function SuppliersPage() {
  const { showNotif } = useNotif();
  const [data, setData]           = useState([]);
  const { paginated, page, setPage, totalPages } = usePagination(data, 10);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Note 1: semua field wajib (name, contact_person, phone, address)
  // notes tetap opsional
  const EMPTY_FORM = { name: "", contact_person: "", phone: "", address: "", notes: "" };
  const [form, setForm] = useState(EMPTY_FORM);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const setPhone = (fullPhone) => setForm(f => ({ ...f, phone: fullPhone }));

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

  const resetForm = () => { setForm(EMPTY_FORM); setEditingId(null); };

  const openAdd  = () => { resetForm(); setShowModal(true); };
  const openEdit = (supplier) => {
    setForm({
      name:           supplier.name           ?? "",
      contact_person: supplier.contact_person ?? "",
      phone:          supplier.phone          ?? "",
      address:        supplier.address        ?? "",
      notes:          supplier.notes          ?? "",
    });
    setEditingId(supplier.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    // Note 1: validasi SEMUA field wajib di FE
    if (!form.name)           { showNotif("Nama supplier wajib diisi", "error");         return; }
    if (!form.contact_person) { showNotif("Contact person wajib diisi", "error");        return; }
    if (!form.phone)          { showNotif("Nomor telepon wajib diisi", "error");          return; }
    if (!form.address)        { showNotif("Alamat wajib diisi", "error");                 return; }

    // Note 2: validasi format E.164 dasar di FE sebelum dikirim ke BE
    const phoneRegex = /^\+[1-9]\d{7,14}$/;
    if (!phoneRegex.test(form.phone)) {
      showNotif("Format telepon tidak valid. Pastikan kode negara + nomor sudah benar.", "error");
      return;
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
            { key: "name",           label: "NAME"           },
            { key: "contact_person", label: "CONTACT PERSON" },
            { key: "phone",          label: "PHONE"          },
            { key: "address",        label: "ADDRESS"        },
            { key: "actions", label: "ACTIONS", render: r => (
              <Btn variant="outline" size="sm" onClick={() => openEdit(r)}>Edit</Btn>
            )},
          ]}
          data={paginated}
          emptyMsg={loading ? "Memuat data..." : 'Belum ada supplier. Klik "Add Supplier" untuk menambahkan.'}
        />
        <PaginationBar page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {showModal && (
        <Modal
          title={editingId ? "Edit Supplier" : "Add Supplier"}
          onClose={() => { setShowModal(false); resetForm(); }}
        >
          {/* Note 1: semua 4 field utama MANDATORY (required) */}
          <Field
            label="Supplier Name"
            value={form.name} onChange={set("name")}
            placeholder="Nama perusahaan/toko supplier"
            required
          />
          <Field
            label="Contact Person"
            value={form.contact_person} onChange={set("contact_person")}
            placeholder="Nama penanggung jawab"
            required
          />
          {/* Note 2: PhoneField dengan dropdown kode negara */}
          <PhoneField
            label="Phone"
            value={form.phone}
            onChange={setPhone}
            required
          />
          <Field
            label="Address"
            value={form.address} onChange={set("address")}
            placeholder="Alamat lengkap supplier"
            required
          />
          <Field
            label="Notes (Opsional)"
            value={form.notes} onChange={set("notes")}
            placeholder="Catatan tambahan"
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