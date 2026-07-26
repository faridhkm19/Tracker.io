# Design System — Tracker.io

Dokumen ini mendokumentasikan sistem desain visual Tracker.io **berdasarkan kondisi kode yang benar-benar ada saat ini** di `frontend/style.css` dan `frontend/index.html`. Seluruh nilai yang tercantum merupakan nilai literal yang diekstrak langsung dari file CSS tanpa modifikasi atau penambahan.

---

## 1. Prinsip Desain

Gaya visual yang tercermin dari kode CSS saat ini dapat disimpulkan sebagai berikut:

- **Card-based layout dengan sudut sangat membulat.** Seluruh section utama (ringkasan saldo, form transaksi, daftar transaksi, chart) dibungkus dalam elemen card dengan `border-radius: 20px`. Card dibatasi oleh border tipis (`1px solid #E4E4E7`) tanpa shadow berat — hanya form card yang memiliki shadow sangat ringan (`0 4px 20px rgba(0,0,0,0.02)`).

- **Palet netral dengan dua aksen semantik.** Warna latar didominasi oleh abu-abu sangat terang (`#F6F7F9`) dan putih (`#FFFFFF`). Aksen biru (`#2563EB`) hanya dipakai pada elemen interaktif (focus state input, link auth, dan teks branding nama aplikasi). Warna hijau dan merah dipakai secara eksklusif untuk mewakili pemasukan dan pengeluaran.

- **Tipografi bersih dengan satu keluarga font.** Seluruh teks menggunakan satu font saja: **Outfit** (Google Fonts). Hierarki visual dibangun melalui variasi `font-weight` (400 hingga 800) dan `letter-spacing` negatif pada angka-angka besar, bukan melalui perbedaan font family.

- **Whitespace yang lega.** Gap antar section `1.75rem`, padding card `24px`, dan gap antar item transaksi `0.75rem` menciptakan ruang napas yang konsisten di seluruh layout.

- **Interaksi minimalis.** Hover state tombol utama hanya mengurangi opacity (`0.85`); tombol sekunder mengubah warna latar. Tidak ada animasi slide, modal overlay, atau transisi halaman.

- **BEM sebagai konvensi penamaan.** Seluruh class CSS menggunakan konvensi BEM dengan namespace `tracker-` sebagai prefix (contoh: `.tracker-form__input`, `.tracker-transaction-item__btn`).

---

## 2. Palet Warna

Seluruh nilai berikut terdefinisi di blok `:root` pada `style.css` (baris 8–28).

| Variabel CSS | Kode Hex | Digunakan pada |
|---|---|---|
| `--bg-page` | `#F6F7F9` | Latar `body`, latar tombol sekunder (`.tracker-search__submit`, `.tracker-transaction-item__btn`), latar chip kategori |
| `--bg-card` | `#FFFFFF` | Latar semua card (summary, form, history, chart, auth card) |
| `--text-dark` | `#09090B` | Warna teks utama `body`, label form, judul transaksi, latar tombol utama `.tracker-form__submit` |
| `--text-muted` | `#71717A` | Label section heading (uppercase), tanggal transaksi, teks footer, teks auth-switch |
| `--accent-blue` | `#2563EB` | Border input saat `:focus`, link di halaman auth, teks ".io" pada nama aplikasi |
| `--accent-light` | `#EFF6FF` | Gradient di card saldo utama (`linear-gradient(145deg, #FFFFFF 40%, #EFF6FF 100%)`) |
| `--color-income` | `#10B981` | Teks nominal pemasukan (`.tracker-summary__stat-amount--income`, `.tracker-transaction-item__amount--income`) |
| `--bg-income` | `#ECFDF5` | Latar ikon kategori untuk transaksi pemasukan |
| `--color-expense` | `#F43F5E` | Teks nominal pengeluaran, tombol hapus chip kategori |
| `--bg-expense` | `#FFF1F2` | Latar ikon kategori untuk transaksi pengeluaran |
| `--border-light` | `#E4E4E7` | Border seluruh card dan input, garis pemisah antar item transaksi, border avatar dan chip |

**Nilai warna yang dipakai di luar variabel `:root` (hard-coded di selector tertentu):**

| Nilai | Digunakan pada |
|---|---|
| `#FCFCFC` | Latar default `.tracker-form__input` |
| `#FAFAFA` | Latar input di dalam `.tracker-search` |
| `#E4E4E7` | Warna `background` hover untuk `.tracker-search__submit` (sama dengan `--border-light`, tapi ditulis hard-coded) |

---

## 3. Tipografi

### Font yang Di-import

```css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
```

Hanya **satu** font family yang di-import: **Outfit** dari Google Fonts, dengan lima weight: 400, 500, 600, 700, 800.

Font diset secara global melalui variabel `--font-family: 'Outfit', sans-serif` dan diterapkan ke `body`. Seluruh input dan tombol mengwarisi font ini via `font-family: inherit`.

### Penggunaan Per Elemen

| Elemen / Class | `font-size` | `font-weight` | Catatan |
|---|---|---|---|
| `.tracker-header__title` (branding) | `1.5rem` | `800` | `letter-spacing: -0.03em` |
| `.tracker-auth-card__title` (branding di auth) | `1.5rem` | `800` | |
| `.tracker-summary__balance-amount` (saldo utama) | `3.5rem` | `800` | `letter-spacing: -0.05em` |
| `.tracker-summary__stat-amount` (total pemasukan/pengeluaran) | `2.25rem` | `700` | `letter-spacing: -0.04em` |
| `.tracker-summary__label` | `0.85rem` | `600` | Uppercase, `letter-spacing: 0.05em` |
| `.tracker-form-section__heading` (judul section) | `0.85rem` | `600` | Uppercase, `letter-spacing: 0.05em` |
| `.tracker-transaction-list__title` | `0.85rem` | `600` | Uppercase, `letter-spacing: 0.05em` |
| `.tracker-form__label` | `0.85rem` | `500` | |
| `.tracker-form__input` | `0.95rem` | (400, inherited) | |
| `.tracker-form__submit` (tombol utama) | `0.95rem` | `600` | |
| `.tracker-search__submit` (tombol sekunder) | `0.95rem` | `600` | |
| `.tracker-transaction-item__title` | `1.05rem` | `600` | text-overflow: ellipsis |
| `.tracker-transaction-item__amount` | `1.1rem` | `700` | |
| `.tracker-transaction-item__date` | `0.8rem` | (400, inherited) | `color: var(--text-muted)` |
| `.tracker-transaction-item__btn` (tombol Edit/Hapus) | `0.75rem` | (400, inherited) | |
| `.tracker-category-chip` | `0.85rem` | (400, inherited) | |
| `.tracker-footer` | `0.85rem` | (400, inherited) | `color: var(--text-muted)` |
| `.auth-form h2` | `1.1rem` | (bawaan heading) | |
| `.auth-switch` | `0.85rem` | (400, inherited) | |
| `.auth-switch a` | (diwarisi) | `600` | `color: var(--accent-blue)` |

---

## 4. Layout & Spacing

### Token Desain dari `:root`

| Variabel | Nilai | Digunakan pada |
|---|---|---|
| `--card-radius` | `20px` | Border-radius semua card (summary, form, history, chart, auth card, category card) |
| `--card-padding` | `24px` | Padding dalam semua card |

### Border & Shadow

| Komponen | Border | Shadow |
|---|---|---|
| Semua card utama | `1px solid var(--border-light)` | Tidak ada (default) |
| `.tracker-form-section__card` | `1px solid var(--border-light)` | `box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02)` |
| `.tracker-form__input` | `1px solid var(--border-light)` | Tidak ada |
| Input saat `:focus` | `border-color: var(--accent-blue)` | Tidak ada |
| `.tracker-transaction-item__btn` | `1px solid var(--border-light)` | Tidak ada |
| `.tracker-category-chip` | `1px solid var(--border-light)` | Tidak ada |

### Border Radius Elemen Spesifik

| Elemen | `border-radius` |
|---|---|
| Card utama (summary, form, chart, auth) | `var(--card-radius)` = `20px` |
| Input (`.tracker-form__input`) | `12px` |
| Tombol utama (`.tracker-form__submit`) | `12px` |
| Tombol sekunder (`.tracker-search__submit`) | `12px` |
| Tombol kecil (`.tracker-transaction-item__btn`) | `6px` |
| Ikon transaksi (`.tracker-transaction-item__icon`) | `16px` |
| Chip kategori (`.tracker-category-chip`) | `20px` |
| Avatar header | `50%` (lingkaran penuh) |

### Gap & Padding Penting

| Komponen | Nilai |
|---|---|
| Gap antar section (`.tracker-app`, `main`) | `1.75rem` |
| Gap grid summary (desktop) | `1.5rem` |
| Gap grid chart | `1.5rem` |
| Gap grid history | `1.5rem` |
| Gap item dalam kolom transaksi | `0.75rem` |
| Padding body | `1.5rem` (desktop) → `0.75rem` (≤768px) |
| Padding card search | `1.25rem 1.5rem` |
| Padding auth card | `2.5rem` |

### Grid Layout Desktop

| Section | Kolom |
|---|---|
| `.tracker-summary` | `2fr 1.25fr 1.25fr` |
| `.tracker-form` | `2fr 1fr 1fr 1fr auto` |
| `.tracker-search__form` | `2.5fr 1fr 1fr 1fr auto` |
| `.tracker-history__grid` | `1fr 1fr` |
| `.tracker-charts__grid` | `1fr 1.5fr` |
| `.tracker-category-form` | `2fr 1fr 1fr auto` |

---

## 5. Komponen UI

### Tombol Utama — `.tracker-form__submit`

```
Background  : var(--text-dark)  →  #09090B (hitam hampir pekat)
Teks        : #FFFFFF
Border      : none
Border-radius: 12px
Padding     : 0.85rem 1.5rem
Height      : 44px (fixed)
Font-weight : 600
Font-size   : 0.95rem
Hover       : opacity 0.85
Active      : transform scale(0.98)
Transisi    : transform 0.1s, opacity 0.2s
```

### Tombol Sekunder — `.tracker-search__submit`

```
Background  : var(--bg-page)  →  #F6F7F9
Border      : 1px solid var(--border-light)  →  #E4E4E7
Border-radius: 12px
Padding     : 0.85rem 1.25rem
Font-weight : 600
Font-size   : 0.95rem
Hover       : background #E4E4E7
```

### Tombol Aksi Kecil — `.tracker-transaction-item__btn`

> Dipakai untuk tombol Edit, Hapus, dan Toggle Tipe di setiap kartu transaksi. Juga dipakai untuk tombol Keluar di header.

```
Background  : var(--bg-page)  →  #F6F7F9
Border      : 1px solid var(--border-light)
Border-radius: 6px
Padding     : 0.2rem 0.4rem
Font-size   : 0.75rem
Hover       : background var(--border-light), color var(--text-dark)
```

### Input Form — `.tracker-form__input`

> Dipakai di form transaksi, form pencarian, form kategori, dan form auth.

```
Background  : #FCFCFC (default) / #FAFAFA (di dalam .tracker-search)
Border      : 1px solid var(--border-light)
Border-radius: 12px
Padding     : 0.85rem 1rem
Font-size   : 0.95rem
Outline     : none (dihapus)
Focus       : border-color var(--accent-blue), background var(--bg-card)
Transisi    : border-color 0.2s
```

### Card Dasar

Selector berikut mendapat gaya card yang sama:

```css
.tracker-summary__balance,
.tracker-summary__stat,
.tracker-form-section__card,
.tracker-search,
.tracker-transaction-list
```

```
Background  : var(--bg-card)  →  #FFFFFF
Border      : 1px solid var(--border-light)
Border-radius: var(--card-radius)  →  20px
Padding     : var(--card-padding)  →  24px
Display     : flex / column
```

Tambahan untuk `.tracker-form-section__card`:

```
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02)
```

### Card Saldo Utama — `.tracker-summary__balance`

```
Background  : linear-gradient(145deg, #FFFFFF 40%, #EFF6FF 100%)
              (gradient dari putih ke biru sangat pucat)
```

### Card Chart — `.tracker-chart-card`

```
Background  : var(--bg-card)
Border      : 1px solid var(--border-light)
Border-radius: var(--card-radius)  →  20px
Padding     : var(--card-padding)  →  24px
Canvas max-height: 280px
```

### Kartu Transaksi — `.tracker-transaction-item`

```
Display     : flex, align-items center, gap 1rem
Padding     : 0.75rem 0 (atas-bawah saja)
Border-bottom: 1px solid var(--border-light)
              (item terakhir: border-bottom: none)
```

**Ikon transaksi (`.tracker-transaction-item__icon`):**
- Ukuran `48×48px`, `border-radius: 16px`
- Pemasukan: `background #ECFDF5`, `color #10B981`
- Pengeluaran: `background #FFF1F2`, `color #F43F5E`

**Judul transaksi (`.tracker-transaction-item__title`):**
- `font-weight: 600`, `font-size: 1.05rem`
- `white-space: nowrap; overflow: hidden; text-overflow: ellipsis` — judul panjang dipotong dengan ellipsis

### Chip Kategori — `.tracker-category-chip`

```
Background  : var(--bg-page)  →  #F6F7F9
Border      : 1px solid var(--border-light)
Border-radius: 20px  (fully rounded pill)
Padding     : 0.4rem 0.6rem 0.4rem 0.9rem
Font-size   : 0.85rem
Display     : flex, align-items center, gap 0.5rem
```

**Tombol hapus di dalam chip (`.tracker-category-chip__delete`):**
- Background: none, border: none
- `color: var(--color-expense)` → `#F43F5E`
- Padding: `0.1rem 0.3rem`

### Auth Card — `.auth-card`

```
Background  : var(--bg-card)  →  #FFFFFF
Border      : 1px solid var(--border-light)
Border-radius: var(--card-radius)  →  20px
Padding     : 2.5rem
Max-width   : 420px
```

---

## 6. Responsive Breakpoints

Terdapat **tiga** breakpoint media query di `style.css`:

### Tablet — `@media (max-width: 1024px)` (baris 465 & 735)

| Komponen | Perubahan |
|---|---|
| `.tracker-summary` | Dari `2fr 1.25fr 1.25fr` → `1fr 1fr` |
| `.tracker-summary__balance` | `grid-column: span 2` (lebar penuh dari 2 kolom) |
| `.tracker-form` | Dari `2fr 1fr 1fr 1fr auto` → `1fr 1fr` |
| `.tracker-form__field:nth-child(1)` (field judul) | `grid-column: span 2` |
| `.tracker-form__submit` | `grid-column: span 2` |
| `.tracker-history__grid` | Dari `1fr 1fr` → `1fr` (satu kolom) |
| `.tracker-charts__grid` | Dari `1fr 1.5fr` → `1fr` (satu kolom) |

### Mobile — `@media (max-width: 768px)` (baris 494 & 701)

| Komponen | Perubahan |
|---|---|
| `body` | Padding dikecilkan: `0.75rem` |
| `.tracker-app`, `main` | Gap dikecilkan: `1rem` |
| `.tracker-summary` | `1fr` (semua card satu kolom), gap `1rem` |
| `.tracker-summary__balance`, `.tracker-summary__stat` | Padding dikecilkan: `1.25rem` |
| `.tracker-summary__balance-amount` | Font-size dikecilkan: `2.25rem`; tambah `word-break: break-all` |
| `.tracker-summary__stat-amount` | Font-size dikecilkan: `1.75rem` |
| `.tracker-form-section__card` | Padding dikecilkan: `1.25rem` |
| `.tracker-form` | Berubah dari grid → `flex-direction: column` |
| `.tracker-form__submit` | `width: 100%` |
| `.tracker-history__grid` | Satu kolom, gap `1rem` |
| `.tracker-search__form` | Berubah ke `flex-direction: column` |
| `.tracker-search__actions` | Berubah ke `flex-direction: column` |
| `.tracker-search__submit` | `width: 100%`, padding `0.85rem` |
| `.tracker-category-form` | Berubah dari grid → `flex-direction: column` |

### Mobile Kecil — `@media (max-width: 640px)` (baris 563)

| Komponen | Perubahan |
|---|---|
| `.tracker-search__form` | `flex-direction: column` |
| `.tracker-search__submit` | `width: 100%`, padding `0.85rem` |
| `.tracker-transaction-item` | `flex-wrap: wrap`, `align-items: flex-start` |
| `.tracker-transaction-item__right` | Menjadi `width: 100%`, `flex-direction: column`, `align-items: stretch` |
| `.tracker-transaction-item__amount` | Tambah `padding-left: 4rem` (indent agar sejajar dengan teks judul) |
| `.tracker-transaction-item__actions` | `width: 100%` |
| `.tracker-transaction-item__btn` | `flex: 1`, padding `0.75rem 0`, font-size `0.85rem`, font-weight `500` |

---

## 7. Status & Catatan

### Asal-usul File CSS

File `style.css` merupakan **adaptasi dari starter template** yang disediakan dalam submission kelas *Front-End Web Pemula* Dicoding. Template awal hanya mencakup section ringkasan saldo (`tracker-summary`), form transaksi (`tracker-form`), dan daftar riwayat (`tracker-history`).

### Penambahan yang Sudah Dilakukan pada Versi Ini

Seluruh blok CSS berikut **ditambahkan setelah template awal** untuk mendukung fitur-fitur baru:

| Blok CSS | Deskripsi |
|---|---|
| `.auth-section`, `.auth-card`, `.auth-form`, `.auth-switch` | Section halaman autentikasi (login & registrasi) yang muncul sebelum aplikasi utama |
| `.tracker-category-section__card`, `.tracker-category-form`, `.tracker-category-list`, `.tracker-category-chip`, `.tracker-category-chip__delete` | Section kelola kategori kustom beserta chip kategori |
| `.tracker-charts__grid`, `.tracker-chart-card` | Section visualisasi data (dua card chart berdampingan) |
| Responsive rules untuk `.tracker-category-form` di `≤768px` | Menyesuaikan form kategori ke layout satu kolom di mobile |
| Responsive rules untuk `.tracker-charts__grid` di `≤1024px` | Menyesuaikan grid chart ke satu kolom di tablet |

### Yang Belum Diubah

- **Tidak ada redesign visual penuh** yang dilakukan pada versi ini. Palet warna, tipografi, spacing, dan gaya komponen pada section-section lama (summary, form transaksi, daftar transaksi) tetap konsisten dengan desain starter template asli Dicoding.
- **Tidak ada dark mode**, tidak ada animasi kompleks, dan tidak ada CSS custom property tambahan di luar yang sudah didefinisikan di `:root`.

---

*Dokumen ini dibuat berdasarkan pembacaan langsung `frontend/style.css` (739 baris) dan `frontend/index.html`. Terakhir diperbarui: 25 Juli 2026.*
