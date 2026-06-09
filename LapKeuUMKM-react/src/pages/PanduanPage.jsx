import styles from "../styles.js";

const SECTIONS = [
  {
    icon: "🛒", title: "Input Pembelian (Purchase Input)",
    steps: [
      'Buka menu "Input Pembelian" dari sidebar',
      'Klik tombol "Add Purchase"',
      "Isi: Tanggal, Nama Supplier, Nama Item, Kuantitas, Harga Satuan",
      "Total amount dihitung otomatis oleh sistem",
      'Klik "Add Purchase" untuk menyimpan',
    ],
    tip: "Semua data pembelian akan tercermin di laporan keuangan dan memengaruhi perhitungan pengeluaran.",
  },
  {
    icon: "💵", title: "Input Penjualan (Sales Input)",
    steps: [
      'Buka menu "Input Penjualan" dari sidebar',
      'Klik tombol "Add Sale"',
      "Isi: Tanggal, Nama Produk, Kuantitas Terjual, Harga Satuan",
      "Tambahkan catatan pelanggan jika diperlukan",
      'Klik "Add Sale" untuk menyimpan',
    ],
    tip: "Data penjualan secara otomatis memperbarui total pendapatan dan stok inventory.",
  },
  {
    icon: "💰", title: "Input Kas (Cash Flow Input)",
    steps: [
      'Buka menu "Input Kas" dari sidebar',
      'Klik "Add Cash In" untuk kas masuk atau "Add Cash Out" untuk kas keluar',
      "Isi: Tanggal, Deskripsi, Kategori, Jumlah",
      'Klik tombol untuk menyimpan',
    ],
    tip: "Net Cash Flow = Total Cash In − Total Cash Out.",
  },
  {
    icon: "📦", title: "Input Inventory",
    steps: [
      'Buka menu "Input Inventory" dari sidebar',
      'Klik "Add Inventory Item"',
      "Isi: Nama Produk, Kategori, Harga Satuan, Kuantitas Awal",
      'Klik "Add Item" untuk menyimpan',
    ],
    tip: "Item dengan kuantitas di bawah 10 unit akan memicu Low Stock Alert.",
  },
  {
    icon: "📊", title: "Reports",
    steps: [
      'Buka menu "Reports" dari sidebar',
      "Atur rentang tanggal dengan From Date dan To Date",
      "Pilih tab: Profit & Loss, Cash Flow, atau Category Analysis",
      "Gunakan Export PDF atau Export Excel untuk unduh laporan",
    ],
    tip: "Tombol export menghasilkan laporan berdasarkan rentang tanggal yang dipilih.",
  },
];

export default function PanduanPage() {
  return (
    <div>
      <h1 style={styles.pageTitle}>Panduan</h1>
      <div style={styles.card}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
          User Guide – UMKM Financial Management System
        </h2>
        <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 24 }}>
          Panduan penggunaan sistem laporan keuangan UMKM.
        </p>

        <div style={{ ...styles.panduanSection, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 22 }}>📖</span>
            <div>
              <h3 style={{ margin: "0 0 8px", fontSize: 16 }}>System Overview</h3>
              <p style={{ color: "#374151", fontSize: 14, margin: "0 0 6px" }}>
                Sistem ini dirancang untuk membantu usaha kecil mengelola keuangan mereka
                mengikuti struktur yang sama dengan template pelaporan keuangan berbasis Excel.
              </p>
              <p style={{ color: "#374151", fontSize: 14, margin: 0 }}>
                Sistem mencatat pembelian, penjualan, arus kas, dan inventory — komponen kritis
                manajemen keuangan UMKM.
              </p>
            </div>
          </div>
        </div>

        {SECTIONS.map((s, i) => (
          <div key={i} style={{ ...styles.panduanSection, marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 10px", fontSize: 15 }}>{s.title}</h3>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Cara penggunaan:</p>
                <ol style={{ margin: 0, paddingLeft: 20 }}>
                  {s.steps.map((step, j) => (
                    <li key={j} style={{ fontSize: 14, color: "#374151", marginBottom: 4 }}>{step}</li>
                  ))}
                </ol>
                {s.tip && (
                  <p style={{ marginTop: 10, fontSize: 13, color: "#6b7280", fontStyle: "italic" }}>
                    💡 Tip: {s.tip}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}