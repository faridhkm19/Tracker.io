# Tracker.io — Aplikasi Pengelola Keuangan Pribadi

Tracker.io adalah aplikasi web full-stack untuk mencatat dan memantau pemasukan serta pengeluaran pribadi. Aplikasi ini dilengkapi dengan sistem autentikasi multi-user, kategori transaksi yang bisa dikustomisasi, filter dan pencarian riwayat transaksi, serta visualisasi data keuangan menggunakan Chart.js.

Backend berjalan sebagai **serverless function di Vercel** dan terhubung ke database **MySQL yang di-hosting oleh Aiven**. Frontend adalah halaman statis berbasis Vanilla HTML, CSS, dan JavaScript murni.

## Fitur Utama

### Autentikasi
- Registrasi akun baru dengan nama lengkap, username, email, dan password
- Password di-hash menggunakan bcryptjs sebelum disimpan ke database
- Login menghasilkan JWT (berlaku 7 hari) yang disimpan di localStorage browser
- Saat halaman dibuka ulang, token diperiksa secara otomatis — jika masih valid, pengguna langsung masuk tanpa perlu login lagi
- Logout menghapus token dan seluruh data sesi dari localStorage

### Manajemen Kategori
- Tambah kategori kustom dengan nama, tipe (pemasukan atau pengeluaran), dan ikon emoji opsional
- Edit dan hapus kategori yang sudah dibuat
- Kategori yang masih digunakan oleh transaksi tidak bisa dihapus, server akan menolak permintaan tersebut
- Setiap kategori bersifat privat per pengguna

### Manajemen Transaksi
- Catat transaksi baru: keterangan, nominal (minimal Rp 1), tanggal, tipe, dan kategori
- Edit semua field transaksi yang sudah ada
- Hapus transaksi dengan konfirmasi terlebih dahulu
- Toggle tipe transaksi (ubah dari pemasukan jadi pengeluaran atau sebaliknya) langsung dari kartu transaksi
- Transaksi diurutkan berdasarkan tanggal terbaru dan ditampilkan dalam dua kolom terpisah

### Filter dan Pencarian
- Cari transaksi berdasarkan kata kunci di judul
- Filter berdasarkan rentang tanggal (start date dan end date bisa dikombinasikan)
- Filter berdasarkan kategori
- Semua filter bisa dipakai bersamaan dalam satu permintaan

### Dashboard dan Visualisasi
- Ringkasan saldo bersih, total pemasukan, dan total pengeluaran (dihitung langsung di query database dengan SUM dan GROUP BY)
- Grafik donut distribusi pengeluaran per kategori menggunakan Chart.js 4.4.0
- Grafik tren bulanan yang menampilkan perbandingan total pemasukan dan pengeluaran dari bulan ke bulan

## Tech Stack

### Backend

| Paket | Versi | Fungsi |
|---|---|---|
| `express` | `^5.2.1` | Web framework untuk REST API |
| `mysql2` | `^3.23.1` | Driver MySQL dengan dukungan Promise dan async/await |
| `bcryptjs` | `^2.4.3` | Hashing password (versi pure JavaScript, kompatibel dengan Vercel) |
| `jsonwebtoken` | `^9.0.3` | Penerbitan dan verifikasi JWT |
| `dotenv` | `^17.4.2` | Membaca environment variables dari file `.env` |
| `cors` | `^2.8.6` | Mengizinkan request lintas origin dari frontend |
| `express-rate-limit` | `^8.6.0` | Membatasi jumlah request untuk mencegah abuse |
| `nodemon` | `^3.1.14` | Auto-restart server saat pengembangan lokal |

**Runtime:** Node.js  
**Database:** MySQL (Aiven)  
**Deployment:** Vercel Serverless

### Frontend

| Library / Resource | Keterangan |
|---|---|
| `chart.js@4.4.0` | Diakses via CDN jsDelivr; digunakan untuk pie chart dan bar chart |
| Vanilla HTML5 | Struktur halaman di `index.html` |
| Vanilla CSS3 | Styling di `style.css` |
| Vanilla JavaScript (ES2017+) | Logic di `config.js`, `auth.js`, `category.js`, `dashboard.js`, `main.js` |

> Frontend tidak menggunakan framework JavaScript seperti React atau Vue. Semua interaksi dibangun dengan JavaScript murni menggunakan Fetch API.

## Struktur Folder

```
Dicoding_ExpenseTrackerStarterProject/
├── vercel.json                 # Konfigurasi routing Vercel untuk root project
├── package.json                # Script delegasi ke backend/
│
├── frontend/
│   ├── index.html              # Single-page app; memuat semua section
│   ├── style.css               # Seluruh styling aplikasi
│   ├── config.js               # Konstanta API_BASE_URL (mengarah ke Vercel)
│   ├── auth.js                 # Logic registrasi, login, logout, token JWT
│   ├── category.js             # CRUD kategori dan pengisian dropdown
│   ├── dashboard.js            # Fetch dan render ringkasan saldo dan chart
│   └── main.js                 # CRUD transaksi, render kartu, filter, pencarian
│
└── backend/
    ├── server.js               # Entry point untuk menjalankan server secara lokal
    ├── vercel.json             # Konfigurasi build dan rewrite untuk Vercel
    ├── package.json
    ├── .env.example            # Template environment variables
    ├── test-api.http           # File testing endpoint (REST Client)
    ├── api/
    │   └── index.js            # Serverless function handler (entry point Vercel)
    └── src/
        ├── app.js              # Konfigurasi Express: middleware, routes, CORS
        ├── config/
        │   └── db.js           # Konfigurasi MySQL connection pool (mysql2/promise)
        ├── middlewares/
        │   └── authMiddleware.js   # Verifikasi JWT; menyisipkan user ke req.user
        ├── controllers/
        │   ├── authController.js
        │   ├── categoryController.js
        │   ├── transactionController.js
        │   └── dashboardController.js
        └── routes/
            ├── authRoutes.js
            ├── categoryRoutes.js
            ├── transactionRoutes.js
            └── dashboardRoutes.js
```

## Cara Menjalankan Secara Lokal

### Prasyarat

- Node.js v18 atau lebih baru
- MySQL Server (lokal atau remote)
- Browser modern

### 1. Clone Repository

```bash
git clone https://github.com/faridhkm19/Tracker.io.git
cd Tracker.io
```

### 2. Siapkan Database MySQL

Buat database baru, lalu jalankan DDL berikut:

```sql
CREATE DATABASE expense_tracker_db;
USE expense_tracker_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  icon VARCHAR(10) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  category_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

### 3. Konfigurasi Environment Backend

```bash
cd backend
cp .env.example .env
```

Isi file `.env` dengan nilai yang sesuai:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=<username_mysql_anda>
DB_PASSWORD=<password_mysql_anda>
DB_NAME=expense_tracker_db
PORT=5000
JWT_SECRET=<string_rahasia_panjang_acak>
```

### 4. Install Dependensi dan Jalankan Backend

```bash
cd backend
npm install
npm run dev
```

Server berjalan di `http://localhost:5000`.

### 5. Jalankan Frontend

Frontend tidak memerlukan build tool. Buka `frontend/index.html` langsung di browser, atau gunakan ekstensi **Live Server** di VS Code.

> Untuk pengembangan lokal, ubah `API_BASE_URL` di `frontend/config.js` menjadi `http://localhost:5000/api`.

## Endpoint API

### Autentikasi `/api/auth`

| Method | Path | Deskripsi | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Daftarkan pengguna baru | Tidak |
| `POST` | `/api/auth/login` | Login; mengembalikan JWT dan data user | Tidak |

### Kategori `/api/categories`

Semua endpoint memerlukan header `Authorization: Bearer <token>`

| Method | Path | Deskripsi |
|---|---|---|
| `GET` | `/api/categories` | Ambil semua kategori milik user; mendukung `?type=income\|expense` |
| `POST` | `/api/categories` | Buat kategori baru (name, type, icon opsional) |
| `PUT` | `/api/categories/:id` | Perbarui kategori |
| `DELETE` | `/api/categories/:id` | Hapus kategori (ditolak jika masih ada transaksi) |

### Transaksi `/api/transactions`

Semua endpoint memerlukan header `Authorization: Bearer <token>`

| Method | Path | Deskripsi |
|---|---|---|
| `GET` | `/api/transactions` | Ambil transaksi; mendukung `?start_date`, `?end_date`, `?category_id`, `?type`, `?keyword` |
| `POST` | `/api/transactions` | Buat transaksi baru |
| `PUT` | `/api/transactions/:id` | Perbarui transaksi |
| `DELETE` | `/api/transactions/:id` | Hapus transaksi |
| `PATCH` | `/api/transactions/:id/toggle-type` | Toggle tipe antara income dan expense |

### Dashboard `/api/dashboard`

Semua endpoint memerlukan header `Authorization: Bearer <token>`

| Method | Path | Deskripsi |
|---|---|---|
| `GET` | `/api/dashboard/summary` | Ringkasan saldo; mendukung `?start_date`, `?end_date` |
| `GET` | `/api/dashboard/by-category` | Agregasi per kategori; mendukung `?type=income\|expense` |
| `GET` | `/api/dashboard/monthly-trend` | Tren bulanan income dan expense |

### Utilitas

| Method | Path | Deskripsi |
|---|---|---|
| `GET` | `/api/health` | Cek apakah server berjalan |
| `GET` | `/api/db-test` | Cek koneksi ke database |

## Skema Database

### Tabel `users`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `INT AUTO_INCREMENT` | Primary key |
| `full_name` | `VARCHAR(100) NOT NULL` | Nama lengkap |
| `username` | `VARCHAR(50) UNIQUE NOT NULL` | Username untuk login |
| `email` | `VARCHAR(100) UNIQUE NOT NULL` | Email pengguna |
| `password_hash` | `VARCHAR(255) NOT NULL` | Password yang sudah di-hash |
| `created_at` | `TIMESTAMP` | Waktu registrasi |

### Tabel `categories`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `INT AUTO_INCREMENT` | Primary key |
| `user_id` | `INT NOT NULL` | Foreign key ke `users.id` |
| `name` | `VARCHAR(100) NOT NULL` | Nama kategori |
| `type` | `ENUM('income', 'expense') NOT NULL` | Tipe kategori |
| `icon` | `VARCHAR(10) DEFAULT NULL` | Emoji ikon (opsional) |
| `created_at` | `TIMESTAMP` | Waktu pembuatan |

### Tabel `transactions`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `INT AUTO_INCREMENT` | Primary key |
| `user_id` | `INT NOT NULL` | Foreign key ke `users.id` |
| `category_id` | `INT NOT NULL` | Foreign key ke `categories.id` |
| `title` | `VARCHAR(255) NOT NULL` | Keterangan transaksi |
| `amount` | `DECIMAL(15, 2) NOT NULL` | Nominal |
| `type` | `ENUM('income', 'expense') NOT NULL` | Tipe transaksi |
| `transaction_date` | `DATE NOT NULL` | Tanggal transaksi |
| `created_at` | `TIMESTAMP` | Waktu pencatatan |

## Kontributor

- **Farid Hakim** — developer dan pengambil keputusan arsitektur

## Lisensi

Proyek pembelajaran pribadi, dibuat untuk keperluan portofolio Dicoding.
