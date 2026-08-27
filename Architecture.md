# Architecture — Tracker.io

Dokumen ini menjelaskan arsitektur teknis Tracker.io secara menyeluruh, mulai dari keputusan deployment, alur data, struktur kode, hingga detail konfigurasi yang krusial untuk membuat aplikasi ini berjalan di lingkungan serverless.

## Gambaran Besar

Tracker.io adalah aplikasi web full-stack yang terdiri dari dua bagian utama: **frontend statis** dan **backend serverless**.

Frontend adalah halaman HTML biasa yang berjalan langsung di browser pengguna tanpa proses build. Semua interaksi dengan server dilakukan melalui Fetch API menggunakan endpoint REST yang disediakan oleh backend.

Backend berjalan sebagai **Vercel Serverless Function**, artinya tidak ada server yang berjalan terus-menerus menunggu request. Setiap kali ada request masuk, Vercel akan menyalakan instance Node.js, memproses request tersebut, mengirimkan respons, lalu mematikan instance-nya kembali. Data disimpan secara permanen di **Aiven MySQL**, sebuah layanan database MySQL yang di-hosting di cloud.

```
Browser (Frontend)
        |
        | HTTPS Request
        v
  Vercel Edge Network
        |
        | Route ke serverless function
        v
  backend/api/index.js  (Vercel Serverless Function)
        |
        | Express app handle request
        v
  backend/src/app.js   (Express Application)
        |
        | mysql2/promise connection pool
        v
  Aiven MySQL (Cloud Database)
```

## Deployment

### Frontend

Frontend terdiri dari file statis (`index.html`, `style.css`, dan file `.js`) yang tidak memerlukan proses build. Saat ini frontend dibuka langsung sebagai file atau melalui server lokal untuk keperluan pengembangan. Semua request API diarahkan ke domain Vercel melalui konstanta `API_BASE_URL` di `frontend/config.js`.

```js
const API_BASE_URL = 'https://tracker-io-backend.vercel.app/api';
```

### Backend — Vercel Serverless

Backend di-deploy ke Vercel menggunakan format serverless function. Seluruh routing masuk diarahkan ke satu file yaitu `backend/api/index.js`.

File `backend/vercel.json` mengatur bagaimana Vercel membangun dan mengarahkan traffic:

```json
{
  "version": 2,
  "builds": [
    { "src": "api/index.js", "use": "@vercel/node" }
  ],
  "rewrites": [
    { "source": "/(.*)", "destination": "/api/index.js" }
  ]
}
```

Poin penting di sini adalah destination harus diawali dengan garis miring (`/api/index.js`, bukan `api/index.js`). Tanpa garis miring tersebut, Vercel Edge Network akan terus-menerus mencoba mengarahkan ulang request secara internal dan tidak pernah menyentuh serverless function, sehingga request berakhir dengan timeout 504.

File `backend/api/index.js` berperan sebagai entry point Vercel. Isinya sederhana: ia hanya menerima request dan response dari Vercel, lalu meneruskannya ke aplikasi Express.

```js
const app = require('../src/app');

module.exports = (req, res) => {
  return app(req, res);
};
```

Kenapa tidak langsung `module.exports = app`? Karena dengan wrapper eksplisit `(req, res) => app(req, res)`, kita memastikan tidak ada ambiguitas format handler antara Vercel dan Express.

### Database — Aiven MySQL

Database MySQL di-hosting oleh Aiven. Koneksi dikonfigurasi di `backend/src/config/db.js` dengan beberapa penyesuaian khusus untuk lingkungan serverless:

```js
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 1,       // Cukup 1 koneksi untuk free tier Aiven
  queueLimit: 0,
  connectTimeout: 15000,
  ssl: {
    rejectUnauthorized: false,  // Kompatibel dengan Vercel + Aiven tanpa CA bundle
  },
  enableKeepAlive: false,   // Agar serverless function bisa terminate dengan bersih
});
```

Tiga konfigurasi kritis di sini:

1. **`connectionLimit: 1`** — Aiven free tier memiliki batas koneksi yang sangat rendah. Jika pool membuka lebih dari satu koneksi, database akan menolak koneksi baru dan request akan gagal.

2. **`rejectUnauthorized: false`** — Aiven menggunakan SSL untuk semua koneksi. Di lingkungan serverless, kita tidak menyimpan CA certificate secara lokal, sehingga verifikasi SSL perlu dinonaktifkan. Koneksi tetap dienkripsi, hanya saja certificate authority-nya tidak diverifikasi.

3. **`enableKeepAlive: false`** — Jika keepAlive aktif, koneksi TCP akan terus dijaga tetap hidup bahkan setelah request selesai. Di serverless, ini mencegah instance function untuk terminate, sehingga Vercel terpaksa mematikannya secara paksa dan menyebabkan error pada request berikutnya.

## Struktur Kode Backend

```
backend/
├── api/
│   └── index.js            # Entry point Vercel Serverless Function
├── server.js               # Entry point untuk menjalankan secara lokal
├── vercel.json             # Konfigurasi build dan routing Vercel
└── src/
    ├── app.js              # Konfigurasi Express: CORS, middleware, routes
    ├── config/
    │   └── db.js           # MySQL connection pool
    ├── middlewares/
    │   └── authMiddleware.js
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

Ada dua entry point di sini karena ada dua cara menjalankan backend:

- **`api/index.js`** digunakan oleh Vercel saat di-deploy ke cloud
- **`server.js`** digunakan saat menjalankan secara lokal dengan `npm run dev`

Keduanya mengimpor aplikasi Express yang sama dari `src/app.js`. Satu-satunya perbedaan adalah `server.js` memanggil `app.listen()` untuk membuka port, sedangkan `api/index.js` hanya mengekspor function handler.

### Lapisan Aplikasi

**`src/app.js`** adalah inti dari aplikasi. Di sinilah semua middleware dan route didaftarkan:

```
Request masuk
    |
    v
express.json()          -- parse JSON body
cors(corsOptions)       -- izinkan cross-origin request
express-rate-limit      -- batasi jumlah request
    |
    v
/api/health             -- endpoint health check (tanpa auth)
/api/db-test            -- endpoint tes koneksi database (tanpa auth)
    |
    v
authMiddleware          -- verifikasi JWT (hanya untuk route terproteksi)
    |
    v
/api/auth               -- authRoutes
/api/categories         -- categoryRoutes
/api/transactions       -- transactionRoutes
/api/dashboard          -- dashboardRoutes
    |
    v
Catch-all 404 handler   -- endpoint tidak ditemukan
```

**`src/middlewares/authMiddleware.js`** memverifikasi JWT dari header `Authorization`. Jika token valid, ia menyisipkan objek user (`{ user_id, username }`) ke dalam `req.user` sehingga controller bisa menggunakannya untuk mengidentifikasi siapa yang membuat request.

**Controller** bertugas memproses logika bisnis dan menjalankan query database. Setiap controller mengambil `req.user.user_id` untuk memastikan bahwa operasi hanya dilakukan pada data milik pengguna yang aktif, bukan berdasarkan parameter yang dikirim dari klien.

## Alur Autentikasi

```
Pengguna mengisi form register/login
        |
        v
Frontend mengirim POST /api/auth/register atau /api/auth/login
        |
        v
authController.js memvalidasi input
        |
        v  (saat register)
bcryptjs.hash(password, 10) -> simpan password_hash ke database
        |
        v  (saat login)
bcryptjs.compare(password, password_hash dari database)
        |
        v  (jika cocok)
jwt.sign({ user_id, username }, JWT_SECRET, { expiresIn: '7d' })
        |
        v
Token dikembalikan ke frontend
        |
        v
Frontend menyimpan token di localStorage
        |
        v
Setiap request berikutnya menyertakan header:
Authorization: Bearer <token>
```

**Kenapa bcryptjs bukan bcrypt?** Paket `bcrypt` asli menggunakan native addons (binary yang dikompilasi dari C++) yang tidak bisa berjalan di lingkungan serverless Vercel karena Vercel tidak mendukung proses kompilasi native saat build. `bcryptjs` adalah implementasi pure JavaScript dengan API yang identik, sehingga bisa berjalan di mana saja tanpa proses kompilasi.

## Alur Request Transaksi (Contoh: Ambil Semua Transaksi)

```
GET /api/transactions?keyword=makan&start_date=2026-08-01
    |
    v
Vercel Edge menerima request dan mengarahkan ke api/index.js
    |
    v
Express menerima request di app.js
    |
    v
authMiddleware.js memverifikasi JWT
Jika valid: req.user = { user_id: 5, username: "farid" }
    |
    v
transactionController.getTransactions() dipanggil
    |
    v
Controller membangun query SQL secara dinamis:
  SELECT t.*, c.name AS category_name, c.icon AS category_icon
  FROM transactions t
  JOIN categories c ON t.category_id = c.id
  WHERE t.user_id = 5
  AND t.title LIKE '%makan%'
  AND t.transaction_date >= '2026-08-01'
  ORDER BY t.transaction_date DESC, t.created_at DESC
    |
    v
mysql2 menjalankan query ke Aiven MySQL
    |
    v
Hasil query dikembalikan sebagai JSON response
```

Perhatikan bahwa `user_id = 5` diambil dari `req.user.user_id` (yang berasal dari token JWT yang sudah diverifikasi), bukan dari query parameter. Ini memastikan pengguna tidak bisa mengakses data milik orang lain meski mencoba memanipulasi request.

## Keamanan

### JWT (JSON Web Token)

JWT berisi payload `{ user_id, username }` dan ditandatangani dengan `JWT_SECRET` yang hanya ada di environment variable server. Token berlaku selama 7 hari. Setiap request ke endpoint terproteksi harus menyertakan token ini di header `Authorization`.

### Isolasi Data Per Pengguna

Setiap query yang menyentuh data sensitif selalu menyertakan kondisi `WHERE user_id = ?` berdasarkan nilai dari token JWT. Ini dilakukan di level controller, bukan di level route, sehingga tidak bisa dilewati dari sisi klien.

### SQL Injection Prevention

Seluruh query menggunakan parameterized query (prepared statements) melalui mysql2. Nilai dari pengguna tidak pernah langsung digabungkan ke string query.

### CORS

CORS dikonfigurasi di `app.js` untuk menerima request dari origin yang terdaftar di environment variable `CORS_ORIGIN`. Jika variabel tersebut tidak diset, semua origin diizinkan (mode debug). Di production, variabel ini harus diisi dengan domain frontend yang sebenarnya.

## Cold Start dan Performa Serverless

Karena backend berjalan sebagai serverless function, ada fenomena yang disebut **cold start**. Ini terjadi ketika tidak ada request selama beberapa menit dan Vercel mematikan instance function. Saat request berikutnya masuk, Vercel harus menyalakan ulang instance, memuat modul Node.js, dan membangun koneksi baru ke database Aiven. Proses ini memakan waktu sekitar 2-5 detik.

Setelah cold start selesai, request selanjutnya (yang masuk dalam waktu berdekatan) akan sangat cepat karena instance masih aktif dan koneksi database masih terbuka. Ini disebut **warm start**.

Untuk proyek portofolio dengan skala ini, cold start adalah kompromi yang wajar mengingat biayanya 100% gratis dan tidak memerlukan manajemen server sama sekali.

## Environment Variables

Berikut adalah seluruh environment variable yang dibutuhkan backend. Nilainya disimpan di file `.env` untuk pengembangan lokal dan di Vercel Dashboard untuk production.

| Variabel | Keterangan |
|---|---|
| `DB_HOST` | Hostname server database Aiven |
| `DB_PORT` | Port database (biasanya 23506 untuk Aiven) |
| `DB_USER` | Username database |
| `DB_PASSWORD` | Password database |
| `DB_NAME` | Nama database |
| `JWT_SECRET` | String rahasia untuk menandatangani JWT (minimal 32 karakter acak) |
| `CORS_ORIGIN` | Origin frontend yang diizinkan, contoh: `https://tracker-io.vercel.app` |
| `PORT` | Port server untuk pengembangan lokal (default: 5000) |

---

*Dokumen ini mencerminkan kondisi arsitektur Tracker.io per 27 Agustus 2026. Perubahan pada deployment, konfigurasi database, atau struktur kode sebaiknya diperbarui di sini.*
