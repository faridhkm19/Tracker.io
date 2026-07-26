# Tracker.io — Aplikasi Pengelola Keuangan Pribadi

Tracker.io adalah aplikasi web full-stack untuk mencatat dan memantau pemasukan serta pengeluaran pribadi secara real-time, dilengkapi dengan sistem autentikasi multi-user, kategori transaksi kustom, filter riwayat transaksi, dan visualisasi data keuangan menggunakan Chart.js.

---

## Tampilan Aplikasi

> [Tambahkan screenshot aplikasi di sini]

---

## Fitur Utama

Fitur-fitur berikut telah terimplementasi dan berfungsi berdasarkan kode yang ada saat ini:

### Autentikasi
- **Registrasi akun** — formulir dengan field nama lengkap, username, email, dan password; password di-hash dengan bcrypt sebelum disimpan
- **Login** — validasi kredensial dan penerbitan JWT (berlaku 7 hari) yang disimpan di `localStorage` browser
- **Logout** — menghapus token dan data user dari `localStorage`, kembali ke halaman auth
- **Persistensi sesi** — saat halaman dibuka ulang, token diperiksa; jika masih valid, pengguna langsung masuk ke aplikasi tanpa login ulang

### Manajemen Kategori
- **Tambah kategori kustom** — nama, tipe (pemasukan/pengeluaran), dan ikon emoji (opsional)
- **Edit kategori** — memperbarui nama, tipe, dan ikon
- **Hapus kategori** — ditolak oleh server apabila kategori masih memiliki transaksi terkait
- Setiap kategori bersifat **privat per pengguna** — pengguna lain tidak dapat mengakses atau memodifikasinya

### Manajemen Transaksi
- **Tambah transaksi** — keterangan, nominal (min. Rp 1), tanggal, tipe, dan kategori (wajib dipilih)
- **Edit transaksi** — formulir yang sama, mengisi ulang data lama yang sudah tersimpan
- **Hapus transaksi** — dengan konfirmasi sebelum penghapusan
- **Toggle tipe transaksi** — mengubah status antara pemasukan dan pengeluaran secara langsung dari kartu transaksi
- Transaksi diurutkan berdasarkan tanggal terbaru; tampilan dibagi menjadi kolom **Arus Pemasukan** dan **Arus Pengeluaran**
- Setiap kartu transaksi menampilkan `category_name` dan `category_icon` yang di-join langsung dari query database

### Filter & Pencarian
- **Pencarian berdasarkan kata kunci** — dicocokkan secara parsial terhadap judul transaksi (SQL `LIKE`)
- **Filter rentang tanggal** — start date dan/atau end date (dapat dikombinasikan)
- **Filter berdasarkan kategori** — dropdown kategori milik pengguna aktif
- Seluruh filter dapat **dikombinasikan** dalam satu request; tombol Reset mengembalikan semua filter ke kondisi awal

### Dashboard & Visualisasi
- **Ringkasan saldo** — total pemasukan, total pengeluaran, dan saldo bersih (selisih keduanya); dihitung di level query database dengan `SUM + GROUP BY`
- **Grafik distribusi per kategori** — donut/pie chart (Chart.js 4.4.0) yang menampilkan nominal pengeluaran per kategori
- **Grafik tren bulanan** — bar/line chart yang menampilkan total pemasukan dan pengeluaran per bulan dari waktu ke waktu

---

## Tech Stack

### Backend

| Paket | Versi (dari `package.json`) | Fungsi |
|---|---|---|
| `express` | `^5.2.1` | Web framework REST API |
| `mysql2` | `^3.23.1` | Driver MySQL dengan dukungan Promise/async |
| `bcrypt` | `^6.0.0` | Hashing password sebelum disimpan ke database |
| `jsonwebtoken` | `^9.0.3` | Penerbitan dan verifikasi JWT |
| `dotenv` | `^17.4.2` | Membaca variabel lingkungan dari file `.env` |
| `cors` | `^2.8.6` | Mengizinkan request lintas-origin dari frontend |
| `nodemon` | `^3.1.14` *(devDependency)* | Auto-restart server saat pengembangan |

**Runtime:** Node.js · **Database:** MySQL

### Frontend

| Library / Resource | Keterangan |
|---|---|
| `chart.js@4.4.0` | Diakses via CDN jsDelivr; digunakan untuk pie chart dan bar chart |
| Vanilla HTML5 | Struktur halaman di `index.html` |
| Vanilla CSS3 | Styling di `style.css` |
| Vanilla JavaScript (ES2017+) | Logic di `config.js`, `auth.js`, `category.js`, `dashboard.js`, `main.js` |

> **Catatan:** Frontend tidak menggunakan framework JavaScript (React, Vue, dll.) — seluruhnya ditulis dengan JavaScript murni menggunakan Fetch API.

---

## Struktur Folder

```
expense-tracker/
├── frontend/
│   ├── index.html          # Single-page app; memuat semua section (auth, form, chart, history)
│   ├── style.css           # Seluruh styling aplikasi
│   ├── config.js           # Konstanta API_BASE_URL (http://localhost:5000/api)
│   ├── auth.js             # Logic registrasi, login, logout, pengelolaan token JWT
│   ├── category.js         # CRUD kategori; mengisi dropdown kategori pada form transaksi
│   ├── dashboard.js        # Fetch & render ringkasan saldo, pie chart, dan tren bulanan
│   └── main.js             # CRUD transaksi, render kartu, logic filter & pencarian
│
└── backend/
    ├── server.js               # Entry point; mendaftarkan semua router ke Express
    ├── package.json
    ├── .env.example            # Template variabel lingkungan
    └── src/
        ├── config/
        │   └── db.js           # Konfigurasi MySQL connection pool (mysql2/promise)
        ├── middlewares/
        │   └── authMiddleware.js   # Verifikasi JWT; menyisipkan user ke req.user
        ├── controllers/
        │   ├── authController.js       # register, login
        │   ├── categoryController.js   # getCategories, createCategory, updateCategory, deleteCategory
        │   ├── transactionController.js # getTransactions, createTransaction, updateTransaction,
        │   │                            # deleteTransaction, toggleTransactionType
        │   └── dashboardController.js  # getSummary, getByCategory, getMonthlyTrend
        └── routes/
            ├── authRoutes.js           # POST /register, POST /login
            ├── categoryRoutes.js       # GET|POST /, PUT|DELETE /:id
            ├── transactionRoutes.js    # GET|POST /, PUT|DELETE /:id, PATCH /:id/toggle-type
            └── dashboardRoutes.js      # GET /summary, /by-category, /monthly-trend
```

---

## Cara Menjalankan Proyek Secara Lokal

### Prasyarat

- Node.js (v18 atau lebih baru)
- MySQL Server (lokal atau remote)
- Browser modern (Chrome, Firefox, Edge)

### 1. Clone Repository

```bash
git clone <url-repository>
cd expense-tracker
```

### 2. Siapkan Database MySQL

Buat database baru di MySQL, lalu jalankan DDL berikut untuk membuat tabel yang dibutuhkan:

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

> **Catatan:** Struktur tabel di atas direkonstruksi berdasarkan nama kolom yang digunakan secara konsisten di seluruh file controller. Tidak terdapat file migrasi/DDL terpisah dalam repository saat ini.

### 3. Konfigurasi Environment Backend

```bash
cd backend
cp .env.example .env
```

Edit file `.env` dan isi nilainya:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=<username_mysql_anda>
DB_PASSWORD=<password_mysql_anda>
DB_NAME=expense_tracker_db
PORT=5000
JWT_SECRET=<string_rahasia_panjang_acak>
```

### 4. Install Dependensi & Jalankan Backend

```bash
# Di dalam folder backend/
npm install

# Mode development (auto-restart dengan nodemon)
npm run dev

# Mode produksi
npm start
```

Server berjalan di `http://localhost:5000`.

### 5. Jalankan Frontend

Frontend tidak memerlukan build tool — cukup buka `frontend/index.html` langsung di browser, atau gunakan ekstensi **Live Server** (VS Code) agar perubahan CSS/JS tercermin secara langsung.

> Pastikan `API_BASE_URL` di `frontend/config.js` sudah menunjuk ke alamat dan port backend yang benar (default: `http://localhost:5000/api`).

---

## Daftar Endpoint API

Semua endpoint di bawah ini terdaftar di file-file dalam `src/routes/` dan dipasang ke Express di `server.js`.

### Autentikasi — `/api/auth`

| Method | Path | Deskripsi | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Mendaftarkan pengguna baru (full_name, username, email, password) | ✗ |
| `POST` | `/api/auth/login` | Login; mengembalikan JWT dan data user dasar | ✗ |

### Kategori — `/api/categories`

*Semua endpoint memerlukan header `Authorization: Bearer <token>`*

| Method | Path | Deskripsi | Auth |
|---|---|---|---|
| `GET` | `/api/categories` | Mengambil semua kategori milik user; mendukung query `?type=income\|expense` | ✓ |
| `POST` | `/api/categories` | Membuat kategori baru (name, type, icon?) | ✓ |
| `PUT` | `/api/categories/:id` | Memperbarui nama, tipe, dan/atau ikon kategori | ✓ |
| `DELETE` | `/api/categories/:id` | Menghapus kategori; ditolak jika masih ada transaksi terkait | ✓ |

### Transaksi — `/api/transactions`

*Semua endpoint memerlukan header `Authorization: Bearer <token>`*

| Method | Path | Deskripsi | Auth |
|---|---|---|---|
| `GET` | `/api/transactions` | Mengambil transaksi user; mendukung query `?start_date=`, `?end_date=`, `?category_id=`, `?type=`, `?keyword=` (dapat dikombinasikan) | ✓ |
| `POST` | `/api/transactions` | Membuat transaksi baru (title, amount, type, transaction_date, category_id) | ✓ |
| `PUT` | `/api/transactions/:id` | Memperbarui seluruh field transaksi | ✓ |
| `DELETE` | `/api/transactions/:id` | Menghapus transaksi | ✓ |
| `PATCH` | `/api/transactions/:id/toggle-type` | Mengubah tipe transaksi antara `income` ↔ `expense` | ✓ |

### Dashboard — `/api/dashboard`

*Semua endpoint memerlukan header `Authorization: Bearer <token>`*

| Method | Path | Deskripsi | Auth |
|---|---|---|---|
| `GET` | `/api/dashboard/summary` | Mengembalikan `total_income`, `total_expense`, `balance`; mendukung query `?start_date=`, `?end_date=` | ✓ |
| `GET` | `/api/dashboard/by-category` | Agregasi total nominal per kategori; mendukung query `?type=income\|expense` | ✓ |
| `GET` | `/api/dashboard/monthly-trend` | Agregasi total income & expense per bulan, diurutkan dari bulan terlama ke terbaru | ✓ |

### Utilitas

| Method | Path | Deskripsi | Auth |
|---|---|---|---|
| `GET` | `/api/health` | Mengecek apakah server Express berjalan | ✗ |
| `GET` | `/api/db-test` | Mengecek koneksi ke database MySQL | ✗ |

---

## Skema Database

Struktur tabel berikut direkonstruksi dari nama kolom yang digunakan secara konsisten di seluruh file controller (`authController.js`, `categoryController.js`, `transactionController.js`, `dashboardController.js`).

### Tabel `users`

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id` | `INT` | `PRIMARY KEY`, `AUTO_INCREMENT` | ID unik pengguna |
| `full_name` | `VARCHAR(100)` | `NOT NULL` | Nama lengkap |
| `username` | `VARCHAR(50)` | `NOT NULL`, `UNIQUE` | Username untuk login |
| `email` | `VARCHAR(100)` | `NOT NULL`, `UNIQUE` | Email pengguna |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | Password yang sudah di-hash dengan bcrypt |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Waktu registrasi |

### Tabel `categories`

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id` | `INT` | `PRIMARY KEY`, `AUTO_INCREMENT` | ID unik kategori |
| `user_id` | `INT` | `NOT NULL`, `FOREIGN KEY → users.id` | Pemilik kategori |
| `name` | `VARCHAR(100)` | `NOT NULL` | Nama kategori |
| `type` | `ENUM('income', 'expense')` | `NOT NULL` | Tipe kategori |
| `icon` | `VARCHAR(10)` | `DEFAULT NULL` | Emoji ikon (opsional) |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Waktu pembuatan |

### Tabel `transactions`

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id` | `INT` | `PRIMARY KEY`, `AUTO_INCREMENT` | ID unik transaksi |
| `user_id` | `INT` | `NOT NULL`, `FOREIGN KEY → users.id` | Pemilik transaksi |
| `category_id` | `INT` | `NOT NULL`, `FOREIGN KEY → categories.id` | Kategori transaksi |
| `title` | `VARCHAR(255)` | `NOT NULL` | Keterangan/judul transaksi |
| `amount` | `DECIMAL(15, 2)` | `NOT NULL` | Nominal (minimal Rp 1) |
| `type` | `ENUM('income', 'expense')` | `NOT NULL` | Tipe transaksi |
| `transaction_date` | `DATE` | `NOT NULL` | Tanggal transaksi |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Waktu pencatatan |

---

## Kontributor

- **Farid Hakim** — developer & pengambil keputusan arsitektur

---

## Lisensi

Proyek pembelajaran pribadi, dibuat untuk keperluan portofolio.
