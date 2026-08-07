# Laporan Keuangan UMKM — Frontend (React + Vite)

Frontend web aplikasi Laporan Keuangan UMKM. Berkomunikasi dengan backend Laravel API melalui HTTP (Bearer token Sanctum).

Backend (Laravel API) berada di folder induk: [`../README.md`](../README.md) — **wajib dijalankan lebih dulu** sebelum frontend ini, karena semua data (login, transaksi, laporan) diambil dari backend tersebut.

---

## 1. Tech Stack

- React 18 + Vite 6
- React Router
- MUI (Material UI) + Radix UI + Tailwind CSS 4
- Axios (HTTP client, walau fetch native juga dipakai di `src/api.js`)
- Recharts (grafik dashboard)

---

## 2. Prasyarat

- **Node.js >= 18** (disarankan LTS terbaru)
- **npm** (satu paket dengan Node.js)
- Backend Laravel API sudah berjalan (lihat `../README.md`), default di `http://localhost:8000`

Cek versi:

```bash
node -v
npm -v
```

---

## 3. Instalasi

Masuk ke folder frontend ini (bukan root repo):

```bash
cd LapKeuUMKM-react
npm install
```

---

## 4. Konfigurasi Koneksi ke Backend

Frontend mengambil URL API dari environment variable `VITE_API_URL`. Kalau tidak diset, defaultnya adalah `http://localhost:8000/api` (lihat `src/api.js`).

Kalau backend dijalankan di alamat/port default (`php artisan serve` → `http://localhost:8000`), **tidak perlu setting apa pun** — langsung jalan dengan default tersebut.

Kalau backend berjalan di alamat lain, buat file `.env` di folder ini (`LapKeuUMKM-react/.env`):

```env
VITE_API_URL=http://alamat-backend-anda:8000/api
```

---

## 5. Menjalankan (Development)

```bash
npm run dev
```

Frontend akan berjalan di **http://localhost:3000** (port sudah diatur khusus di `vite.config.js`, bukan default Vite `5173`).

> Pastikan port `3000` ini sudah termasuk dalam `allow_origins` di `config/cors.php` milik backend — secara default sudah termasuk, jadi tidak perlu perubahan tambahan.

Login menggunakan akun demo dari seeder backend:

- **Email:** `test@example.com`
- **Password:** `password`

---

## 6. Build untuk Produksi

```bash
npm run build
```

Hasil build akan otomatis masuk ke `../public/react` (lihat konfigurasi `build.outDir` di `vite.config.js`) — yaitu folder public milik backend Laravel, bukan folder `dist` biasa.

Untuk preview hasil build secara lokal:

```bash
npm run preview
```

---

## 7. Troubleshooting Umum

| Masalah | Solusi |
|---|---|
| Halaman blank / gagal fetch data, console error `Failed to fetch` | Pastikan backend Laravel sudah jalan (`php artisan serve`) sebelum membuka frontend |
| Error CORS di console browser | Pastikan frontend dijalankan di port `3000` (default project ini), atau tambahkan port yang dipakai ke `config/cors.php` backend |
| Login sukses tapi halaman lain menampilkan Unauthorized | Cek `localStorage` browser — key `umkm_token` harus terisi token dari response login. Coba logout lalu login ulang |
| Export PDF/Excel tidak terunduh | Pastikan endpoint backend `/api/reports/export/pdf` dan `/api/reports/export/excel` bisa diakses langsung (cek juga token login belum kedaluwarsa) |
| `npm install` error terkait versi peer dependency | Jalankan `npm install --legacy-peer-deps` |

---

## 8. Struktur Singkat

```
src/
├─ api.js              → Wrapper fetch ke backend (apiFetch, apiFetchForm, apiDownload)
├─ pages/               → Halaman utama (Dashboard, Reports, CashFlow, Inventory, dll)
├─ components/          → Komponen UI reusable
└─ src-backup/          → (arsip/cadangan, tidak dipakai build aktif)
```