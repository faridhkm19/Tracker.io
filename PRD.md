# Product Requirements Document (PRD)

## Tracker.io — Aplikasi Pengelola Keuangan Pribadi

| Atribut | Nilai |
|---|---|
| Versi Dokumen | 2.0 |
| Tanggal | 27 Agustus 2026 |
| Status | Final |
| Penulis | Farid Hakim |
| Teknologi | Node.js, Express, MySQL (Aiven), Vercel Serverless, Vanilla JS/HTML/CSS, Chart.js |

## 1. Development Tools

### Pendekatan Pengembangan

Proyek Tracker.io dibangun menggunakan pendekatan kolaboratif antara developer dan AI Agent, mencakup Claude (Anthropic), Gemini (Google DeepMind), dan ChatGPT (OpenAI). Dalam alur kerja ini, AI Agent berperan sebagai mitra implementasi teknis: membantu penulisan kode backend dan frontend, menjelaskan konsep, menyusun dokumentasi, serta memberikan saran perbaikan ketika terjadi bug atau hambatan. Sementara itu, developer memegang kendali penuh atas seluruh keputusan yang bersifat arsitektural dan strategis.

### Pembagian Tanggung Jawab

**Developer bertanggung jawab atas:**
- Perencanaan dan pendefinisian kebutuhan fitur sebelum implementasi
- Desain skema database (struktur tabel, relasi, constraint)
- Keputusan pemilihan teknologi dan platform deployment
- Pengujian manual di setiap tahap implementasi
- Debugging masalah nyata yang muncul selama pengembangan
- Validasi akhir sebelum setiap tahap dinyatakan selesai

**AI Agent membantu dalam hal:**
- Penulisan kode sesuai spesifikasi yang telah didefinisikan developer
- Penjelasan konsep teknis yang relevan dengan implementasi yang berjalan
- Penyusunan dokumentasi proyek
- Pemberian saran perbaikan dan alternatif solusi saat terjadi hambatan teknis

## 2. Problem Statement

### Latar Belakang

Pengelolaan keuangan pribadi adalah kebiasaan yang mudah direncanakan tapi sulit dipertahankan. Banyak individu — terutama mahasiswa dan pekerja muda — mencatat pengeluaran secara sporadis di buku catatan atau spreadsheet, atau sama sekali tidak mencatatnya. Akibatnya, mereka kehilangan visibilitas atas pola pengeluaran dan kesulitan membuat keputusan finansial yang tepat.

### Masalah dengan Pendekatan Awal (localStorage, Single-User)

Versi awal aplikasi ini dikembangkan sebagai proyek submission kelas Front-End Web Pemula Dicoding. Seluruh data transaksi disimpan menggunakan Web Storage API (localStorage) di browser pengguna. Pendekatan ini memiliki beberapa keterbatasan mendasar:

1. **Tidak bisa diakses lintas perangkat.** Data terkunci di browser dan perangkat yang sama. Jika pengguna berpindah perangkat, seluruh catatan hilang.
2. **Tidak ada isolasi data antar pengguna.** Aplikasi hanya mendukung satu pengguna tanpa autentikasi, sehingga tidak layak digunakan di perangkat bersama.
3. **Data mudah hilang.** Membersihkan cache browser cukup untuk menghapus seluruh riwayat transaksi secara permanen.
4. **Tidak ada kategorisasi bermakna.** Transaksi hanya dibedakan berdasarkan tipe dasar (income/expense), tanpa pengelompokan yang personal.
5. **Tidak ada wawasan visual.** Tanpa data yang persisten, fitur visualisasi seperti grafik distribusi dan tren bulanan tidak bisa dibangun secara andal.

### Kebutuhan yang Mendorong Pengembangan

Keterbatasan tersebut mendorong transformasi aplikasi menjadi sistem full-stack multi-user dengan backend Node.js/Express dan database MySQL. Data kini disimpan secara terpusat dan aman di Aiven, setiap pengguna memiliki akun dan ruang data yang terisolasi, dan seluruh backend berjalan sebagai serverless function di Vercel agar tidak memerlukan manajemen server.

## 3. Goals

Tujuan produk yang ingin dicapai oleh Tracker.io:

1. **G-1 — Pencatatan yang Aman dan Personal:** Memungkinkan setiap pengguna mencatat, mengedit, dan menghapus transaksi pribadi dengan jaminan bahwa data satu pengguna tidak bisa diakses pengguna lain.

2. **G-2 — Kategorisasi yang Fleksibel:** Memberikan kemampuan kepada pengguna untuk mendefinisikan kategori transaksi kustom sesuai kebutuhan mereka sendiri, misalnya "Kos", "Ngopi", atau "Gaji Freelance", sehingga catatan keuangan lebih relevan dan personal.

3. **G-3 — Wawasan Visual atas Pola Keuangan:** Menyajikan visualisasi berupa grafik distribusi pengeluaran per kategori dan tren pemasukan vs. pengeluaran bulanan, sehingga pengguna dapat memahami pola keuangan mereka secara sekilas.

4. **G-4 — Penemuan Transaksi yang Efisien:** Memungkinkan pengguna menemukan transaksi spesifik dengan cepat melalui kombinasi filter tanggal, filter kategori, dan pencarian berdasarkan judul.

5. **G-5 — Keandalan dan Persistensi Data:** Menjamin bahwa seluruh data transaksi tersimpan secara persisten di database relasional, dapat diakses dari perangkat manapun selama pengguna terautentikasi.

## 4. Target Users

### Persona 1 — Andi, Mahasiswa Perantau (22 tahun)

Andi adalah mahasiswa semester akhir yang tinggal di kos dan mengelola uang saku bulanan dari orang tua. Ia sering merasa uangnya habis begitu saja tanpa tahu ke mana perginya. Ia pernah mencoba mencatat di Notes HP, tapi tidak konsisten. Andi membutuhkan alat yang mudah digunakan, tidak memerlukan instalasi, dan bisa memberinya gambaran jelas berapa yang ia habiskan untuk kebutuhan tertentu setiap bulan. Karena ia menggunakan HP dan laptop secara bergantian, data yang tersinkronisasi lintas perangkat menjadi kebutuhan penting.

### Persona 2 — Risa, Pekerja Muda (26 tahun)

Risa baru saja mulai bekerja dan ingin disiplin mengatur keuangan. Ia membutuhkan aplikasi yang memungkinkan pembuatan kategori kustom sesuai pengeluaran spesifiknya seperti "BPJS", "Investasi Reksa Dana", atau "Belanja Online", serta visualisasi data yang membantu melihat distribusi pengeluaran tanpa harus membuka spreadsheet.

## 5. User Stories

### Registrasi dan Login

- Sebagai pengguna baru, saya ingin mendaftarkan akun dengan nama lengkap, username, email, dan password, supaya saya memiliki akun pribadi yang melindungi data keuangan saya.
- Sebagai pengguna terdaftar, saya ingin masuk menggunakan username dan password saya, supaya saya dapat mengakses seluruh data transaksi yang tersimpan.

### Tambah / Edit / Hapus Transaksi

- Sebagai pengguna, saya ingin menambahkan transaksi baru dengan mengisi judul, nominal, tipe, tanggal, dan kategori, supaya riwayat keuangan saya tercatat dengan lengkap.
- Sebagai pengguna, saya ingin mengedit detail transaksi yang sudah tersimpan, supaya saya dapat memperbaiki kesalahan pencatatan.
- Sebagai pengguna, saya ingin menghapus transaksi yang tidak relevan, supaya riwayat keuangan saya tetap bersih.

### Membuat Kategori Kustom

- Sebagai pengguna, saya ingin membuat kategori baru dengan nama dan tipe yang saya tentukan sendiri, supaya saya dapat mengelompokkan transaksi sesuai kebutuhan dan gaya hidup saya.
- Sebagai pengguna, saya ingin mengedit atau menghapus kategori yang sudah saya buat, supaya saya dapat memperbarui sistem kategorisasi seiring berjalannya waktu.

### Filter dan Pencarian

- Sebagai pengguna, saya ingin memfilter daftar transaksi berdasarkan rentang tanggal, supaya saya dapat fokus menganalisis pengeluaran pada periode tertentu.
- Sebagai pengguna, saya ingin memfilter transaksi berdasarkan kategori tertentu, supaya saya dapat melihat semua transaksi dalam satu pos pengeluaran.
- Sebagai pengguna, saya ingin mencari transaksi berdasarkan kata kunci di judul, supaya saya dapat menemukan catatan tertentu dengan cepat.

### Dashboard dan Visualisasi

- Sebagai pengguna, saya ingin melihat ringkasan total pemasukan, total pengeluaran, dan saldo bersih secara sekilas, supaya saya dapat langsung mengetahui kondisi keuangan saya.
- Sebagai pengguna, saya ingin melihat grafik distribusi pengeluaran per kategori, supaya saya dapat mengenali pos mana yang paling besar.
- Sebagai pengguna, saya ingin melihat grafik tren pemasukan dan pengeluaran dari bulan ke bulan, supaya saya dapat mengevaluasi apakah kondisi keuangan saya membaik atau memburuk.

## 6. Functional Requirements

### Modul: Autentikasi

| Kode | Kebutuhan Fungsional |
|---|---|
| FR-1 | Sistem menerima data registrasi berupa `full_name`, `username`, `email`, dan `password`; seluruh field wajib diisi. |
| FR-2 | Sistem menolak registrasi apabila `username` atau `email` sudah terdaftar, dan mengembalikan pesan error yang informatif. |
| FR-3 | Sistem menyimpan password dalam bentuk hash menggunakan bcryptjs dan tidak pernah menyimpan plaintext. |
| FR-4 | Sistem memvalidasi kombinasi `username` dan `password` saat login; apabila salah, sistem mengembalikan pesan umum tanpa mengungkapkan field mana yang keliru. |
| FR-5 | Sistem menerbitkan JWT dengan masa berlaku 7 hari setelah login berhasil, beserta data pengguna dasar. |
| FR-6 | Sistem menolak permintaan ke endpoint terproteksi apabila header `Authorization` tidak menyertakan JWT yang valid, dengan status HTTP 401. |

### Modul: Manajemen Kategori

| Kode | Kebutuhan Fungsional |
|---|---|
| FR-7 | Sistem mengizinkan pengguna terautentikasi membuat kategori baru dengan `name` (wajib), `type` (wajib), dan `icon` (opsional). |
| FR-8 | Sistem menolak pembuatan kategori apabila `name` atau `type` tidak disertakan. |
| FR-9 | Nilai `type` hanya boleh berupa `income` atau `expense`; nilai lain ditolak. |
| FR-10 | Sistem hanya menampilkan, mengizinkan edit, dan menghapus kategori milik pengguna yang aktif. |
| FR-11 | Sistem mencegah penghapusan kategori yang masih memiliki transaksi terkait. |
| FR-12 | Sistem mendukung filter daftar kategori berdasarkan `type` melalui query parameter. |

### Modul: Manajemen Transaksi

| Kode | Kebutuhan Fungsional |
|---|---|
| FR-13 | Sistem mengizinkan pembuatan transaksi baru dengan `title`, `amount` (minimal 1), `type`, `transaction_date`, dan `category_id` yang semuanya wajib diisi. |
| FR-14 | Sistem menolak transaksi apabila `title` kosong, `amount` bukan angka positif, atau `category_id` tidak valid. |
| FR-15 | Sistem memverifikasi bahwa `category_id` yang digunakan merupakan milik pengguna aktif. |
| FR-16 | Sistem mengizinkan pengedit atribut `title`, `amount`, `type`, `transaction_date`, dan `category_id`. |
| FR-17 | Sistem mengizinkan penghapusan transaksi milik pengguna aktif; transaksi milik pengguna lain mengembalikan 404. |
| FR-18 | Sistem menyertakan `category_name` dan `category_icon` pada setiap data transaksi yang dikembalikan, tanpa request tambahan dari klien. |

### Modul: Filter dan Pencarian

| Kode | Kebutuhan Fungsional |
|---|---|
| FR-19 | Sistem mendukung filter berdasarkan `start_date` melalui query parameter. |
| FR-20 | Sistem mendukung filter berdasarkan `end_date` melalui query parameter. |
| FR-21 | Sistem mendukung filter berdasarkan `category_id` melalui query parameter. |
| FR-22 | Sistem mendukung filter berdasarkan `type` melalui query parameter. |
| FR-23 | Sistem mendukung pencarian berdasarkan `keyword` yang dicocokkan secara parsial terhadap field `title`. |
| FR-24 | Seluruh filter dapat dikombinasikan secara bersamaan dalam satu request dengan logika AND. |
| FR-25 | Daftar transaksi dikembalikan diurutkan berdasarkan `transaction_date` terbaru. |

### Modul: Dashboard dan Visualisasi

| Kode | Kebutuhan Fungsional |
|---|---|
| FR-26 | Sistem menyediakan endpoint `/api/dashboard/summary` yang mengembalikan `total_income`, `total_expense`, dan `balance`. |
| FR-27 | Endpoint ringkasan mendukung filter opsional berdasarkan `start_date` dan `end_date`. |
| FR-28 | Sistem menyediakan endpoint `/api/dashboard/by-category` yang mengembalikan total nominal per kategori beserta nama dan ikon kategori. |
| FR-29 | Endpoint per kategori mendukung filter opsional berdasarkan `type`. |
| FR-30 | Sistem menyediakan endpoint `/api/dashboard/monthly-trend` yang mengembalikan agregasi income dan expense per bulan, dari bulan terlama ke terbaru. |

## 7. Non-Functional Requirements

### Keamanan

| Kode | Kebutuhan Non-Fungsional |
|---|---|
| NFR-1 | Password wajib di-hash menggunakan bcryptjs dengan salt rounds minimal 10; plaintext tidak boleh disimpan dalam bentuk apapun. |
| NFR-2 | Seluruh endpoint yang memerlukan identitas pengguna wajib diproteksi menggunakan middleware verifikasi JWT. |
| NFR-3 | Setiap query database yang menyentuh data pengguna wajib menyertakan kondisi `WHERE user_id = ?` berdasarkan identitas dari token JWT, bukan dari parameter yang dikirim klien. |
| NFR-4 | Seluruh query database menggunakan parameterized query untuk mencegah SQL Injection. |

### Performa

| Kode | Kebutuhan Non-Fungsional |
|---|---|
| NFR-5 | Agregasi data dashboard dihitung menggunakan fungsi SQL (`SUM`, `GROUP BY`) di level database, bukan di sisi JavaScript. |
| NFR-6 | Filter dan pencarian transaksi dieksekusi sebagai satu query SQL tunggal dengan klausa WHERE yang dibangun secara dinamis. |

### Kegunaan (Usability)

| Kode | Kebutuhan Non-Fungsional |
|---|---|
| NFR-7 | Validasi input dilakukan di dua lapisan: di sisi klien untuk umpan balik instan, dan di sisi server sebagai lapisan keamanan. |
| NFR-8 | Setiap respons error API menyertakan pesan yang spesifik dan mudah dipahami pengguna akhir. |
| NFR-9 | Antarmuka memberikan konfirmasi visual untuk tindakan yang tidak bisa dibatalkan seperti penghapusan. |

### Keandalan dan Pemeliharaan

| Kode | Kebutuhan Non-Fungsional |
|---|---|
| NFR-10 | Kredensial sensitif disimpan dalam file `.env` dan tidak boleh di-commit ke repositori. |
| NFR-11 | Arsitektur backend mengikuti pemisahan tanggung jawab yang jelas: `routes` hanya mendefinisikan endpoint, `controllers` mengandung logika bisnis dan query, serta `middlewares` menangani autentikasi. |
| NFR-12 | Konfigurasi database pool disesuaikan dengan karakteristik serverless: `connectionLimit: 1` agar tidak melebihi batas koneksi Aiven free tier, dan `enableKeepAlive: false` agar serverless function bisa terminate dengan bersih. |

## 8. Scope

### In Scope

**Autentikasi dan Manajemen Pengguna**
- Registrasi akun baru
- Login dengan JWT-based authentication
- Proteksi endpoint berdasarkan token

**Manajemen Kategori Kustom**
- Membuat, mengedit, dan menghapus kategori
- Dukungan ikon emoji
- Pencegahan penghapusan kategori yang masih digunakan

**Manajemen Transaksi**
- Mencatat, mengedit, dan menghapus transaksi
- Toggle tipe transaksi
- Pengurutan berdasarkan tanggal terbaru

**Filter dan Pencarian**
- Filter tanggal, kategori, dan tipe
- Pencarian berdasarkan judul
- Kombinasi filter secara bersamaan

**Dashboard dan Visualisasi**
- Ringkasan saldo bersih, total pemasukan, dan total pengeluaran
- Grafik distribusi per kategori (Chart.js)
- Grafik tren bulanan (Chart.js)

**Infrastruktur**
- Backend REST API dengan Node.js dan Express
- Serverless deployment di Vercel
- Database MySQL di Aiven
- Frontend SPA berbasis Vanilla HTML/CSS/JavaScript

### Out of Scope

| Fitur | Alasan Dikecualikan |
|---|---|
| Multi-currency | Memerlukan integrasi API kurs dan logika konversi yang meningkatkan kompleksitas signifikan |
| Ekspor laporan (PDF/Excel/CSV) | Memerlukan library rendering di luar cakupan proyek ini |
| Fitur anggaran/budget | Memerlukan iterasi produk lebih lanjut |
| Notifikasi dan pengingat | Memerlukan infrastruktur push notification atau email |
| Aplikasi mobile native | Proyek berfokus pada web application |
| Berbagi data antar pengguna | Fitur kolaborasi tidak direncanakan |
| Fitur sosial | Tidak ada komunitas atau gamifikasi |
| Lampiran transaksi | Upload bukti struk tidak termasuk lingkup ini |
| Autentikasi pihak ketiga | Login via Google atau OAuth tidak diimplementasikan |

---

*Dokumen ini adalah living document. Setiap perubahan pada fitur atau arsitektur proyek sebaiknya direfleksikan dalam revisi PRD ini.*
