# Laporan Keuangan UMKM — Backend (Laravel API)

Backend REST API untuk aplikasi Laporan Keuangan UMKM. Menangani autentikasi, data transaksi (pembelian, penjualan, arus kas, inventory), serta pembuatan laporan keuangan dalam format **PDF** dan **Excel**.

Frontend (React + Vite) berada di folder terpisah: [`LapKeuUMKM-react/`](./LapKeuUMKM-react/README.md).

---

## 1. Tech Stack

| Komponen | Teknologi |
|---|---|
| Framework | Laravel 12 |
| Bahasa | PHP ^8.2 |
| Autentikasi | Laravel Sanctum (Bearer token, bukan cookie-based SPA) |
| Database default | SQLite (bisa diganti MySQL) |
| Export PDF | barryvdh/laravel-dompdf |
| Export Excel | maatwebsite/excel |

---

## 2. Prasyarat

Pastikan sudah terinstall di komputer:

- **PHP >= 8.2** beserta ekstensi umum Laravel (mbstring, pdo_sqlite/pdo_mysql, openssl, fileinfo, dll)
- **Composer** (dependency manager PHP)
- **Node.js >= 18** & **npm** (dipakai untuk build asset root `resources/`, bukan untuk frontend React)
- Salah satu dari:
  - **SQLite** (bawaan PHP, tidak perlu install server terpisah) — **rekomendasi untuk development**, atau
  - **MySQL/MariaDB** jika ingin pakai database server

Cek versi:

```bash
php -v
composer -V
node -v
npm -v
```

---

## 3. Instalasi

Clone repo dan masuk ke root folder (folder ini, bukan `LapKeuUMKM-react/`):

```bash
git clone https://github.com/Limpossible001/Laporan-Keuangan-UMKM-berbasis-web-application.git
cd Laporan-Keuangan-UMKM-berbasis-web-application
```

### 3.1 Install dependency PHP

```bash
composer install
```

### 3.2 Buat file environment

```bash
cp .env.example .env
php artisan key:generate
```

### 3.3 Konfigurasi database

**Opsi 1— MySQL:**

Buka `.env`, ubah menjadi:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laporan_keuangan_umkm
DB_USERNAME=root
DB_PASSWORD=
```

**Opsi 2 — SQLite (default, paling cepat untuk operasional/testing):**

`.env` sudah default `DB_CONNECTION=sqlite`. Cukup buat file databasenya:

```bash
touch database/database.sqlite
```

(Windows PowerShell: `New-Item database/database.sqlite -ItemType File`)

Buat database `laporan_keuangan_umkm` terlebih dahulu di MySQL sebelum lanjut ke langkah migrasi.

### 3.4 Jalankan migrasi (+ data dummy/demo)

```bash
php artisan migrate --seed
```

> Seeder akan membuat akun demo untuk login pertama kali:
> - **Email:** `test@example.com`
> - **Password:** `password`
>
> Beserta data dummy pembelian, penjualan, arus kas, dan inventory (berbahasa Indonesia via Faker `id_ID`) supaya laporan tidak kosong saat pertama kali dicoba.

Kalau hanya ingin struktur tabel tanpa data dummy, jalankan `php artisan migrate` saja (tanpa `--seed`).

### 3.5 Link storage (wajib untuk upload foto profil)

Fitur upload foto profil menyimpan file ke disk `public`, jadi symlink storage perlu dibuat:

```bash
php artisan storage:link
```

---

## 4. Menjalankan Server

### Opsi cepat (server saja)

```bash
php artisan serve
```

Backend akan berjalan di **http://localhost:8000**, dan semua endpoint API tersedia di **http://localhost:8000/api/...**

### Opsi lengkap (server + queue + log viewer, sekaligus, satu command)

Project ini sudah menyediakan script composer `dev` yang menjalankan `php artisan serve`, queue listener, `artisan pail` (log viewer), sekaligus secara paralel:

```bash
composer run dev
```

> Catatan: fitur inti aplikasi (auth, transaksi, laporan) **tidak bergantung pada queue worker** — tidak ada job yang di-dispatch ke queue di kode saat ini, jadi `php artisan serve` saja sudah cukup untuk menjalankan seluruh fitur. 
> Queue listener disediakan sebagai antisipasi kebutuhan ke depan.

---

## 5. Koneksi dengan Frontend (CORS)

`config/cors.php` sudah mengizinkan origin berikut secara default:

- `http://localhost:3000` (dev server React/Vite frontend — lihat `LapKeuUMKM-react/README.md`)
- `http://localhost:5173` (default port Vite jika port 3000 tidak dipakai)

Jika frontend di-deploy ke domain/port lain, tambahkan origin tersebut ke array `allow_origins` di `config/cors.php`.

Autentikasi antara frontend dan backend menggunakan **Bearer token Sanctum** (token dikirim lewat header `Authorization: Bearer <token>`), **bukan** mekanisme cookie/CSRF Sanctum SPA — jadi tidak perlu setting `SANCTUM_STATEFUL_DOMAINS`.

---

## 6. Testing

```bash
composer test
```

atau langsung:

```bash
php artisan test
```

---

## 7. Fitur Utama Backend

- Autentikasi (register/login/logout) via Sanctum token — `/api/auth/*`
- CRUD Supplier, Purchase (Pembelian), Sale (Penjualan), Cash Flow (Arus Kas), Inventory
- Dashboard ringkasan — `/api/dashboard`
- Activity log — `/api/activity-logs`
- Laporan keuangan (Laba Rugi, Arus Kas, Analisis Kategori) — `/api/reports/*`
- Ekspor laporan ke **PDF** dan **Excel** — `/api/reports/export/pdf` dan `/api/reports/export/excel`

---

## 8. Troubleshooting Umum

| Masalah | Solusi |
|---|---|
| `could not find driver` saat migrate | Aktifkan ekstensi `pdo_sqlite` (atau `pdo_mysql`) di `php.ini` |
| `SQLSTATE[HY000] [14] unable to open database file` | Pastikan `database/database.sqlite` sudah dibuat (langkah 3.3) dan folder `database/` bisa ditulis |
| Login berhasil tapi request lain 401 Unauthorized | Pastikan frontend mengirim header `Authorization: Bearer <token>` yang didapat dari response login |
| CORS error di browser | Pastikan origin frontend terdaftar di `config/cors.php`, lalu jalankan `php artisan config:clear` |
| Foto profil tidak muncul (404) | Jalankan `php artisan storage:link` |
| Export PDF/Excel gagal | Pastikan `barryvdh/laravel-dompdf` dan `maatwebsite/excel` terinstall (`composer install` ulang), cek storage permission untuk file temporer |

---

## 9. Struktur Singkat

```
app/Http/Controllers/Api/   → Controller REST API (Auth, Purchase, Sale, CashFlow, Report, dll)
app/Models/                 → Eloquent Models
app/Exports/                → Definisi export Excel (maatwebsite/excel)
database/migrations/        → Skema database
database/seeders/           → Data dummy/demo
resources/views/reports/    → Template Blade untuk export PDF (dompdf)
routes/api.php              → Daftar seluruh endpoint API
```