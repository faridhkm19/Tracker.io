# Product Requirements Document (PRD)

##Tracker.io — Aplikasi Pengelola Keuangan Pribadi

| Atribut       | Nilai                                        |
| ------------- | -------------------------------------------- |
| Versi Dokumen | 1.0                                          |
| Tanggal       | 25 Juli 2026                                 |
| Status        | Draft                                        |
| Penulis       | Farid Hakim                                  |
| Teknologi     | Node.js · Express · MySQL · Vanilla JS/HTML/CSS · Chart.js |

---

## 1. Development Tools

### Pendekatan Pengembangan

Proyek Tracker.io dibangun menggunakan pendekatan pengembangan kolaboratif antara developer dan AI Agent, mencakup Claude (Anthropic), Gemini (Google DeepMind), dan ChatGPT (OpenAI). Dalam alur kerja ini, AI Agent berperan sebagai mitra implementasi teknis: membantu penulisan kode backend dan frontend, menjelaskan konsep, menyusun dokumentasi, serta menyarankan perbaikan saat terjadi bug. Sementara itu, developer memegang kendali penuh atas seluruh keputusan yang bersifat arsitektural dan strategis — mulai dari perencanaan fitur, desain database, pemilihan teknologi, hingga validasi hasil di setiap tahap.

### Pembagian Tanggung Jawab

**Developer bertanggung jawab atas:**
- Perencanaan dan pendefinisian kebutuhan fitur sebelum implementasi dimulai
- Desain skema database (struktur tabel, relasi antar entitas, constraint)
- Keputusan pemilihan teknologi (MySQL, Express.js, JWT, bcrypt, Chart.js)
- Pengujian manual di setiap tahap implementasi menggunakan REST Client dan browser
- Debugging masalah nyata yang muncul selama proses pengembangan
- Validasi akhir sebelum setiap tahap dinyatakan selesai dan siap dilanjutkan

**AI Agent membantu dalam hal:**
- Penulisan kode sesuai spesifikasi dan konteks yang telah didefinisikan developer
- Penjelasan konsep teknis yang relevan dengan implementasi yang sedang berjalan
- Penyusunan dokumentasi proyek (termasuk dokumen PRD ini)
- Pemberian saran perbaikan dan alternatif solusi saat terjadi bug atau hambatan teknis

---

## 2. Problem Statement

### Latar Belakang

Pengelolaan keuangan pribadi merupakan kebiasaan yang mudah direncanakan namun sulit dipertahankan. Banyak individu — terutama mahasiswa dan pekerja muda — mencatat pengeluaran secara sporadis di buku catatan atau spreadsheet, atau sama sekali tidak mencatatnya. Akibatnya, mereka kehilangan visibilitas atas pola pengeluaran mereka dan kesulitan membuat keputusan finansial yang tepat.

### Masalah dengan Pendekatan Awal (localStorage, Single-User)

Versi awal aplikasi ini dikembangkan sebagai proyek submission kelas *Front-End Web Pemula* Dicoding. Seluruh data transaksi disimpan menggunakan **Web Storage API (localStorage)** di browser pengguna. Pendekatan ini memiliki beberapa keterbatasan mendasar:

1. **Tidak dapat diakses lintas perangkat.** Data terkunci di browser dan perangkat yang sama; jika pengguna berpindah perangkat atau menggunakan browser berbeda, seluruh catatan hilang.
2. **Tidak ada isolasi data antar pengguna.** Aplikasi hanya mendukung satu pengguna (single-user) tanpa mekanisme autentikasi, sehingga tidak layak digunakan di perangkat bersama.
3. **Data mudah hilang.** Pengguna yang membersihkan cache browser atau melakukan reset perangkat akan kehilangan seluruh riwayat transaksi secara permanen tanpa kemungkinan pemulihan.
4. **Tidak ada kategorisasi yang bermakna.** Transaksi hanya dibedakan berdasarkan tipe dasar (*income*/*expense*), tanpa kemampuan mengelompokkan ke dalam kategori yang lebih personal dan kontekstual.
5. **Tidak ada wawasan visual.** Tanpa agregasi data yang persisten, fitur visualisasi seperti grafik distribusi pengeluaran dan tren bulanan tidak mungkin dibangun secara andal.

### Kebutuhan yang Mendorong Pengembangan

Keterbatasan tersebut mendorong transformasi aplikasi menjadi sistem **full-stack multi-user** dengan backend Node.js/Express dan database MySQL. Dengan arsitektur ini, data disimpan secara terpusat dan aman, setiap pengguna memiliki akun dan ruang data yang terisolasi, serta agregasi data dapat dilakukan secara efisien di level database — bukan di sisi klien.

---

## 3. Goals

Berikut adalah tujuan produk yang ingin dicapai olehTracker.io:

1. **G-1 — Pencatatan yang Aman dan Personal:** Memungkinkan setiap pengguna mencatat, mengedit, dan menghapus transaksi keuangan pribadi mereka secara aman, dengan jaminan bahwa data satu pengguna tidak dapat diakses oleh pengguna lain.

2. **G-2 — Kategorisasi yang Fleksibel:** Memberikan kemampuan kepada pengguna untuk mendefinisikan kategori transaksi kustom sesuai kebutuhan hidup mereka sendiri (misalnya: "Kos", "Ngopi", "Gaji Freelance"), sehingga catatan keuangan menjadi lebih relevan dan personal.

3. **G-3 — Wawasan Visual atas Pola Keuangan:** Menyajikan visualisasi data berupa grafik distribusi pengeluaran per kategori (pie/donut chart) dan tren pemasukan vs. pengeluaran bulanan (bar/line chart), sehingga pengguna dapat memahami pola keuangan mereka secara sekilas tanpa harus membaca baris demi baris transaksi.

4. **G-4 — Penemuan Transaksi yang Efisien:** Memungkinkan pengguna menemukan transaksi spesifik dengan cepat melalui kombinasi filter tanggal, filter kategori, dan pencarian berdasarkan judul, sehingga riwayat keuangan yang panjang pun tetap mudah ditelusuri.

5. **G-5 — Keandalan dan Persistensi Data:** Menjamin bahwa seluruh data transaksi tersimpan secara persisten di database relasional, dapat diakses dari perangkat manapun selama pengguna terautentikasi, dan tidak bergantung pada state browser lokal.

---

## 4. Target Users

### Persona 1 — Andi, Mahasiswa Perantau (22 tahun)

Andi adalah mahasiswa semester akhir yang tinggal di kos dan mengelola uang saku bulanan dari orang tua. Ia sering merasa uangnya "habis begitu saja" tanpa tahu ke mana perginya. Ia pernah mencoba mencatat di Notes HP, tapi tidak konsisten. Andi membutuhkan alat yang **mudah digunakan**, **tidak memerlukan instalasi aplikasi**, dan bisa memberinya gambaran jelas berapa banyak yang ia habiskan untuk kebutuhan tertentu (makan, transportasi, hiburan) setiap bulannya. Ia menggunakan HP dan laptop secara bergantian, sehingga data yang tersinkronisasi lintas perangkat menjadi kebutuhan penting.

### Persona 2 — Risa, Pekerja Muda (26 tahun)

Risa baru saja mulai bekerja dan menerima gaji pertamanya. Ia ingin mulai disiplin mengatur keuangan, memisahkan pos-pos pengeluaran, dan melacak apakah penghasilannya cukup untuk memenuhi kebutuhan bulanan. Risa cukup melek teknologi dan terbiasa menggunakan aplikasi web. Ia membutuhkan aplikasi yang memungkinkan pembuatan **kategori kustom** sesuai pengeluaran spesifiknya (misalnya: "BPJS", "Investasi Reksa Dana", "Belanja Online"), serta **visualisasi data** yang membantu ia melihat distribusi pengeluaran tanpa harus membuka spreadsheet.

---

## 5. User Stories

### Registrasi & Login

- Sebagai pengguna baru, saya ingin mendaftarkan akun dengan nama lengkap, username, email, dan password, supaya saya memiliki akun pribadi yang melindungi data keuangan saya.
- Sebagai pengguna terdaftar, saya ingin masuk ke aplikasi menggunakan username dan password saya, supaya saya dapat mengakses seluruh data transaksi saya yang tersimpan.

### Tambah / Edit / Hapus Transaksi

- Sebagai pengguna, saya ingin menambahkan transaksi baru dengan mengisi judul, nominal, tipe (pemasukan/pengeluaran), tanggal, dan kategori, supaya riwayat keuangan saya tercatat dengan lengkap dan terstruktur.
- Sebagai pengguna, saya ingin mengedit detail transaksi yang sudah tersimpan, supaya saya dapat memperbaiki kesalahan pencatatan tanpa harus menghapus dan membuat ulang transaksi.
- Sebagai pengguna, saya ingin menghapus transaksi yang tidak relevan, supaya riwayat keuangan saya tetap bersih dan akurat.

### Membuat Kategori Kustom

- Sebagai pengguna, saya ingin membuat kategori baru dengan nama dan tipe (pemasukan/pengeluaran) yang saya tentukan sendiri, supaya saya dapat mengelompokkan transaksi sesuai kebutuhan dan gaya hidup saya yang unik.
- Sebagai pengguna, saya ingin mengedit atau menghapus kategori yang sudah saya buat, supaya saya dapat memperbarui sistem kategorisasi saya seiring berjalannya waktu.

### Memfilter Transaksi Berdasarkan Tanggal

- Sebagai pengguna, saya ingin memfilter daftar transaksi berdasarkan rentang tanggal tertentu (misalnya: 1–31 Juli 2026), supaya saya dapat fokus menganalisis pengeluaran pada periode waktu yang spesifik.

### Memfilter Transaksi Berdasarkan Kategori

- Sebagai pengguna, saya ingin memfilter daftar transaksi berdasarkan kategori tertentu, supaya saya dapat melihat semua transaksi yang termasuk dalam satu pos pengeluaran sekaligus.

### Mencari Transaksi Berdasarkan Judul

- Sebagai pengguna, saya ingin mencari transaksi berdasarkan kata kunci dalam judul (misalnya: "Grabfood", "Listrik"), supaya saya dapat menemukan catatan transaksi tertentu dengan cepat tanpa harus menggulir seluruh riwayat.

### Melihat Ringkasan Saldo

- Sebagai pengguna, saya ingin melihat ringkasan total pemasukan, total pengeluaran, dan saldo bersih saya secara sekilas di bagian atas halaman, supaya saya dapat langsung mengetahui kondisi keuangan saya saat ini tanpa perlu menghitung manual.

### Melihat Visualisasi Distribusi Pengeluaran per Kategori

- Sebagai pengguna, saya ingin melihat grafik distribusi pengeluaran (atau pemasukan) saya yang dipecah per kategori dalam bentuk pie atau donut chart, supaya saya dapat mengenali pos pengeluaran mana yang paling besar dan mengidentifikasi area yang perlu saya hemat.

### Melihat Tren Bulanan

- Sebagai pengguna, saya ingin melihat grafik tren pemasukan dan pengeluaran saya dari bulan ke bulan, supaya saya dapat mengevaluasi apakah kondisi keuangan saya membaik atau memburuk dari waktu ke waktu.

---

## 6. Functional Requirements

### Modul: Autentikasi

| Kode  | Kebutuhan Fungsional |
| ----- | -------------------- |
| FR-1  | Sistem harus menerima data registrasi berupa `full_name`, `username`, `email`, dan `password`; seluruh field bersifat wajib diisi. |
| FR-2  | Sistem harus menolak registrasi apabila `username` atau `email` yang dimasukkan sudah terdaftar di database, dan mengembalikan pesan error yang informatif. |
| FR-3  | Sistem harus menyimpan password pengguna dalam bentuk hash (menggunakan bcrypt) dan tidak pernah menyimpan password dalam bentuk plaintext. |
| FR-4  | Sistem harus memvalidasi kombinasi `username` dan `password` saat login; apabila salah satu tidak cocok, sistem mengembalikan pesan `"Username atau password salah"` tanpa mengungkapkan field mana yang keliru. |
| FR-5  | Sistem harus menerbitkan JSON Web Token (JWT) dengan masa berlaku 7 hari setelah login berhasil, dan mengembalikan data pengguna dasar (`id`, `full_name`, `username`, `email`) bersama token tersebut. |
| FR-6  | Sistem harus menolak setiap permintaan ke endpoint yang terproteksi apabila header `Authorization` tidak menyertakan JWT yang valid, dan mengembalikan status HTTP `401 Unauthorized`. |

---

### Modul: Manajemen Kategori

| Kode  | Kebutuhan Fungsional |
| ----- | -------------------- |
| FR-7  | Sistem harus mengizinkan pengguna yang terautentikasi untuk membuat kategori baru dengan atribut `name` (wajib), `type` (`income` atau `expense`, wajib), dan `icon` (opsional). |
| FR-8  | Sistem harus menolak pembuatan kategori apabila `name` atau `type` tidak disertakan, dan mengembalikan pesan validasi yang jelas. |
| FR-9  | Sistem harus memastikan nilai `type` pada kategori hanya dapat berupa `income` atau `expense`; nilai lain harus ditolak. |
| FR-10 | Sistem hanya boleh menampilkan, mengizinkan pengeditan, dan mengizinkan penghapusan kategori yang dimiliki oleh pengguna yang sedang aktif (isolasi data per user). |
| FR-11 | Sistem harus mencegah penghapusan kategori yang masih memiliki transaksi terkait, dan mengembalikan pesan yang meminta pengguna untuk memindahkan transaksi tersebut terlebih dahulu. |
| FR-12 | Sistem harus mendukung filter daftar kategori berdasarkan `type` (`income` atau `expense`) melalui query parameter. |

---

### Modul: Manajemen Transaksi

| Kode  | Kebutuhan Fungsional |
| ----- | -------------------- |
| FR-13 | Sistem harus mengizinkan pengguna yang terautentikasi untuk membuat transaksi baru dengan atribut `title` (wajib), `amount` (wajib, minimal Rp 1), `type` (`income` atau `expense`, wajib), `transaction_date` (wajib), dan `category_id` (wajib). |
| FR-14 | Sistem harus menolak pembuatan transaksi apabila `title` kosong atau hanya berisi spasi, `amount` bukan angka positif, atau `category_id` tidak valid. |
| FR-15 | Sistem harus memverifikasi bahwa `category_id` yang digunakan dalam suatu transaksi merupakan milik pengguna yang aktif; jika bukan, sistem mengembalikan error `404 Not Found`. |
| FR-16 | Sistem harus mengizinkan pengguna mengedit atribut `title`, `amount`, `type`, `transaction_date`, dan `category_id` dari transaksi yang mereka miliki. |
| FR-17 | Sistem harus mengizinkan pengguna menghapus transaksi yang mereka miliki; transaksi milik pengguna lain harus mengembalikan error `404 Not Found`. |
| FR-18 | Sistem harus menyertakan informasi `category_name` dan `category_icon` pada setiap data transaksi yang dikembalikan, tanpa memerlukan request tambahan dari klien. |

---

### Modul: Filter & Pencarian

| Kode  | Kebutuhan Fungsional |
| ----- | -------------------- |
| FR-19 | Sistem harus mendukung filter daftar transaksi berdasarkan `start_date` (batas awal tanggal) melalui query parameter. |
| FR-20 | Sistem harus mendukung filter daftar transaksi berdasarkan `end_date` (batas akhir tanggal) melalui query parameter. |
| FR-21 | Sistem harus mendukung filter daftar transaksi berdasarkan `category_id` tertentu melalui query parameter. |
| FR-22 | Sistem harus mendukung filter daftar transaksi berdasarkan `type` (`income` atau `expense`) melalui query parameter. |
| FR-23 | Sistem harus mendukung pencarian transaksi berdasarkan `keyword` yang dicocokkan secara parsial (LIKE) terhadap field `title`, melalui query parameter. |
| FR-24 | Seluruh filter dan pencarian di atas harus dapat dikombinasikan secara bersamaan dalam satu request, dengan logika AND antar kondisi. |
| FR-25 | Daftar transaksi yang dikembalikan harus diurutkan berdasarkan `transaction_date` terbaru, kemudian `created_at` terbaru sebagai tiebreaker. |

---

### Modul: Dashboard & Visualisasi

| Kode  | Kebutuhan Fungsional |
| ----- | -------------------- |
| FR-26 | Sistem harus menyediakan endpoint ringkasan (`/api/dashboard/summary`) yang mengembalikan `total_income`, `total_expense`, dan `balance` (selisih keduanya) untuk pengguna yang aktif. |
| FR-27 | Endpoint ringkasan harus mendukung filter opsional berdasarkan `start_date` dan `end_date` sehingga pengguna dapat melihat ringkasan untuk periode waktu tertentu. |
| FR-28 | Sistem harus menyediakan endpoint agregasi per kategori (`/api/dashboard/by-category`) yang mengembalikan total nominal transaksi, dikelompokkan per kategori, beserta `category_name` dan `category_icon`. |
| FR-29 | Endpoint agregasi per kategori harus mendukung filter opsional berdasarkan `type` (`income` atau `expense`) agar dapat digunakan baik untuk pie chart pemasukan maupun pengeluaran. |
| FR-30 | Sistem harus menyediakan endpoint tren bulanan (`/api/dashboard/monthly-trend`) yang mengembalikan data agregasi total `income` dan `expense` per bulan, diurutkan dari bulan terlama ke terbaru, dalam format yang siap dikonsumsi oleh library charting. |

---

## 7. Non-Functional Requirements

### Keamanan

| Kode   | Kebutuhan Non-Fungsional |
| ------ | ------------------------ |
| NFR-1  | Password pengguna wajib di-hash menggunakan algoritma **bcrypt** dengan salt rounds minimal 10 sebelum disimpan ke database; plaintext password tidak boleh disimpan dalam bentuk apapun. |
| NFR-2  | Seluruh endpoint yang memerlukan identitas pengguna wajib diproteksi menggunakan middleware verifikasi **JWT**; token dikirimkan melalui header `Authorization: Bearer <token>`. |
| NFR-3  | Setiap query database yang menyentuh data pengguna (transaksi, kategori, dashboard) wajib menyertakan kondisi `WHERE user_id = ?` berdasarkan identitas dari token JWT, bukan dari parameter yang dikirim klien — sehingga isolasi data antar pengguna terjamin pada level query. |
| NFR-4  | Seluruh query database menggunakan **parameterized query** (prepared statements) untuk mencegah serangan SQL Injection. |

### Performa

| Kode   | Kebutuhan Non-Fungsional |
| ------ | ------------------------ |
| NFR-5  | Agregasi data untuk dashboard (total pemasukan, total pengeluaran, distribusi per kategori, tren bulanan) harus dihitung menggunakan fungsi agregasi SQL (`SUM`, `GROUP BY`) di level database — bukan dengan mengambil seluruh baris transaksi ke memori server lalu menghitungnya di sisi JavaScript/client. |
| NFR-6  | Setiap operasi filter dan pencarian transaksi harus dieksekusi sebagai satu query SQL tunggal dengan klausa `WHERE` yang dibangun secara dinamis, bukan sebagai beberapa query terpisah yang hasilnya disaring di aplikasi. |

### Kegunaan (Usability)

| Kode   | Kebutuhan Non-Fungsional |
| ------ | ------------------------ |
| NFR-7  | Validasi input wajib dilakukan di dua lapisan: di sisi **klien** (menggunakan JavaScript sebelum pengiriman form) untuk memberikan umpan balik instan, dan di sisi **server** (di dalam controller) sebagai lapisan keamanan yang tidak dapat dilewati. |
| NFR-8  | Setiap respons error dari API harus menyertakan pesan yang spesifik dan mudah dipahami oleh pengguna akhir (misalnya: `"Nominal transaksi harus berupa angka dan minimal Rp 1"`, bukan sekadar `"Bad Request"`). |
| NFR-9  | Antarmuka pengguna harus memberikan umpan balik visual yang jelas untuk operasi yang memerlukan konfirmasi, khususnya untuk tindakan yang tidak dapat dibatalkan seperti penghapusan transaksi dan kategori. |

### Keandalan & Pemeliharaan

| Kode   | Kebutuhan Non-Fungsional |
| ------ | ------------------------ |
| NFR-10 | Kredensial sensitif (URL database, secret JWT, kredensial MySQL) harus disimpan dalam file `.env` dan tidak boleh di-commit ke dalam repositori kode sumber (dikecualikan via `.gitignore`). |
| NFR-11 | Arsitektur backend harus mengikuti pemisahan tanggung jawab yang jelas: `routes` hanya mendefinisikan endpoint, `controllers` mengandung logika bisnis dan query, serta `middlewares` menangani autentikasi — sehingga setiap bagian dapat diuji dan dipelihara secara independen. |

---

## 8. Scope

### In Scope

Fitur-fitur berikut adalah bagian dari proyekTracker.io dan sudah atau akan dibangun:

**Autentikasi & Manajemen Pengguna**
- Registrasi akun baru (nama lengkap, username, email, password)
- Login dengan JWT-based authentication
- Proteksi endpoint berdasarkan token JWT

**Manajemen Kategori Kustom**
- Membuat, mengedit, dan menghapus kategori transaksi (income/expense)
- Dukungan ikon (emoji) untuk kategori
- Pencegahan penghapusan kategori yang masih digunakan

**Manajemen Transaksi**
- Mencatat transaksi baru (pemasukan dan pengeluaran)
- Mengedit dan menghapus transaksi
- Pengurutan transaksi berdasarkan tanggal terbaru

**Filter & Pencarian**
- Filter berdasarkan rentang tanggal (start date - end date)
- Filter berdasarkan kategori
- Filter berdasarkan tipe (income/expense)
- Pencarian berdasarkan judul (keyword search)
- Kombinasi filter secara bersamaan

**Dashboard & Visualisasi**
- Ringkasan saldo bersih, total pemasukan, dan total pengeluaran
- Grafik distribusi per kategori (pie/donut chart menggunakan Chart.js)
- Grafik tren bulanan pemasukan vs. pengeluaran (bar/line chart menggunakan Chart.js)

**Infrastruktur**
- Backend REST API dengan Node.js dan Express
- Database relasional MySQL
- Frontend SPA berbasis Vanilla HTML/CSS/JavaScript

---

### Out of Scope

Fitur-fitur berikut secara sengaja **tidak** dibangun dalam proyek ini, karenaTracker.io merupakan proyek pembelajaran dan portofolio dengan cakupan yang terdefinisi:

| Fitur | Alasan Dikecualikan |
| ----- | ------------------- |
| **Multi-currency** | Memerlukan integrasi API kurs valuta asing dan logika konversi yang meningkatkan kompleksitas secara signifikan |
| **Ekspor laporan** (PDF/Excel/CSV) | Memerlukan library rendering server-side atau client-side yang berada di luar cakupan proyek ini |
| **Fitur anggaran/budget** | Pengelolaan budget (menetapkan batas pengeluaran per kategori dan notifikasi saat mendekati batas) merupakan fitur yang memerlukan iterasi produk lebih lanjut |
| **Notifikasi & pengingat** | Memerlukan infrastruktur push notification atau email yang berada di luar scope backend sederhana ini |
| **Aplikasi mobile native** | Proyek ini berfokus pada web application; versi mobile (iOS/Android) tidak direncanakan |
| **Berbagi data antar pengguna** | Fitur kolaborasi atau berbagi laporan keuangan bersama pasangan/keluarga tidak direncanakan |
| **Fitur sosial** | Tidak ada fitur komunitas, perbandingan pengeluaran antar pengguna, atau gamifikasi |
| **Lampiran transaksi** | Upload bukti struk atau foto nota tidak termasuk dalam lingkup proyek ini |
| **Autentikasi pihak ketiga** | Login via Google, Facebook, atau OAuth provider lain tidak diimplementasikan |

---

*Dokumen ini merupakan living document. Setiap perubahan pada fitur atau arsitektur proyek sebaiknya direfleksikan dalam revisi PRD ini.*
