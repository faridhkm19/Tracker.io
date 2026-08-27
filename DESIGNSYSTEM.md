# Design System — Tracker.io

Dokumen ini mendokumentasikan sistem desain visual Tracker.io berdasarkan kondisi kode yang ada saat ini di `frontend/style.css` dan `frontend/index.html`. Seluruh nilai yang tercantum diekstrak langsung dari file CSS tanpa modifikasi.

## 1. Prinsip Desain

Gaya visual yang tercermin dari kode CSS dapat disimpulkan sebagai berikut:

**Card-based layout dengan sudut sangat membulat.** Seluruh section utama (ringkasan saldo, form transaksi, daftar transaksi, chart) dibungkus dalam card dengan `border-radius: 20px`. Card dibatasi oleh border tipis `1px solid #E4E4E7` tanpa shadow berat. Hanya form card yang memiliki shadow sangat ringan `0 4px 20px rgba(0,0,0,0.02)`.

**Palet netral dengan dua aksen semantik.** Warna latar didominasi abu-abu sangat terang `#F6F7F9` dan putih `#FFFFFF`. Aksen biru `#2563EB` hanya dipakai pada elemen interaktif seperti focus state input, link auth, dan teks branding. Warna hijau dan merah dipakai secara eksklusif untuk mewakili pemasukan dan pengeluaran.

**Tipografi bersih dengan satu keluarga font.** Seluruh teks menggunakan satu font saja yaitu Outfit dari Google Fonts. Hierarki visual dibangun melalui variasi `font-weight` (400 hingga 800) dan `letter-spacing` negatif pada angka-angka besar.

**Whitespace yang lega.** Gap antar section 1.75rem, padding card 24px, dan gap antar item transaksi 0.75rem menciptakan ruang napas yang konsisten di seluruh layout.

**Interaksi minimalis.** Hover state tombol utama hanya mengurangi opacity menjadi 0.85. Tombol sekunder mengubah warna latar saat di-hover. Tidak ada animasi slide, modal overlay, atau transisi halaman yang kompleks.

**BEM sebagai konvensi penamaan.** Seluruh class CSS menggunakan konvensi BEM dengan namespace `tracker-` sebagai prefix, contohnya `.tracker-form__input` atau `.tracker-transaction-item__btn`.

## 2. Palet Warna

Seluruh nilai berikut terdefinisi di blok `:root` pada `style.css`.

| Variabel CSS | Kode Hex | Digunakan pada |
|---|---|---|
| `--bg-page` | `#F6F7F9` | Latar `body`, latar tombol sekunder, latar chip kategori |
| `--bg-card` | `#FFFFFF` | Latar semua card |
| `--text-dark` | `#09090B` | Warna teks utama, label form, latar tombol utama |
| `--text-muted` | `#71717A` | Label section heading, tanggal transaksi, teks footer |
| `--accent-blue` | `#2563EB` | Border input saat focus, link di halaman auth |
| `--accent-light` | `#EFF6FF` | Gradient di card saldo utama |
| `--color-income` | `#10B981` | Teks nominal pemasukan |
| `--bg-income` | `#ECFDF5` | Latar ikon kategori untuk transaksi pemasukan |
| `--color-expense` | `#F43F5E` | Teks nominal pengeluaran, tombol hapus chip kategori |
| `--bg-expense` | `#FFF1F2` | Latar ikon kategori untuk transaksi pengeluaran |
| `--border-light` | `#E4E4E7` | Border seluruh card dan input, garis antar item |

**Nilai warna yang dipakai di luar variabel `:root`:**

| Nilai | Digunakan pada |
|---|---|
| `#FCFCFC` | Latar default `.tracker-form__input` |
| `#FAFAFA` | Latar input di dalam `.tracker-search` |

## 3. Tipografi

### Font yang Di-import

```css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
```

Hanya satu font family yang digunakan: **Outfit** dari Google Fonts, dengan lima weight: 400, 500, 600, 700, dan 800.

Font diset secara global melalui variabel `--font-family: 'Outfit', sans-serif` dan diterapkan ke `body`. Seluruh input dan tombol mewarisi font ini via `font-family: inherit`.

### Penggunaan Per Elemen

| Elemen / Class | `font-size` | `font-weight` | Catatan |
|---|---|---|---|
| `.tracker-header__title` | `1.5rem` | `800` | `letter-spacing: -0.03em` |
| `.tracker-auth-card__title` | `1.5rem` | `800` | |
| `.tracker-summary__balance-amount` | `3.5rem` | `800` | `letter-spacing: -0.05em` |
| `.tracker-summary__stat-amount` | `2.25rem` | `700` | `letter-spacing: -0.04em` |
| `.tracker-summary__label` | `0.85rem` | `600` | Uppercase, `letter-spacing: 0.05em` |
| `.tracker-form-section__heading` | `0.85rem` | `600` | Uppercase, `letter-spacing: 0.05em` |
| `.tracker-transaction-list__title` | `0.85rem` | `600` | Uppercase, `letter-spacing: 0.05em` |
| `.tracker-form__label` | `0.85rem` | `500` | |
| `.tracker-form__input` | `0.95rem` | 400 (inherited) | |
| `.tracker-form__submit` | `0.95rem` | `600` | |
| `.tracker-transaction-item__title` | `1.05rem` | `600` | text-overflow: ellipsis |
| `.tracker-transaction-item__amount` | `1.1rem` | `700` | |
| `.tracker-transaction-item__date` | `0.8rem` | 400 (inherited) | `color: var(--text-muted)` |
| `.tracker-transaction-item__btn` | `0.75rem` | 400 (inherited) | |
| `.tracker-category-chip` | `0.85rem` | 400 (inherited) | |
| `.tracker-footer` | `0.85rem` | 400 (inherited) | `color: var(--text-muted)` |

## 4. Layout dan Spacing

### Token Desain dari `:root`

| Variabel | Nilai | Digunakan pada |
|---|---|---|
| `--card-radius` | `20px` | Border-radius semua card |
| `--card-padding` | `24px` | Padding dalam semua card |

### Border dan Shadow

| Komponen | Border | Shadow |
|---|---|---|
| Semua card utama | `1px solid var(--border-light)` | Tidak ada |
| `.tracker-form-section__card` | `1px solid var(--border-light)` | `0 4px 20px rgba(0, 0, 0, 0.02)` |
| `.tracker-form__input` | `1px solid var(--border-light)` | Tidak ada |
| Input saat `:focus` | `border-color: var(--accent-blue)` | Tidak ada |
| `.tracker-transaction-item__btn` | `1px solid var(--border-light)` | Tidak ada |

### Border Radius Elemen Spesifik

| Elemen | `border-radius` |
|---|---|
| Card utama | `var(--card-radius)` = `20px` |
| Input (`.tracker-form__input`) | `12px` |
| Tombol utama (`.tracker-form__submit`) | `12px` |
| Tombol sekunder (`.tracker-search__submit`) | `12px` |
| Tombol kecil (`.tracker-transaction-item__btn`) | `6px` |
| Ikon transaksi | `16px` |
| Chip kategori | `20px` (fully rounded pill) |
| Avatar header | `50%` (lingkaran penuh) |

### Gap dan Padding Penting

| Komponen | Nilai |
|---|---|
| Gap antar section | `1.75rem` |
| Gap grid summary (desktop) | `1.5rem` |
| Gap grid chart | `1.5rem` |
| Gap item dalam kolom transaksi | `0.75rem` |
| Padding body (desktop) | `1.5rem` |
| Padding body (mobile) | `0.75rem` |
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

## 5. Komponen UI

### Tombol Utama — `.tracker-form__submit`

```
Background   : var(--text-dark)  = #09090B
Teks         : #FFFFFF
Border       : none
Border-radius: 12px
Padding      : 0.85rem 1.5rem
Height       : 44px (fixed)
Font-weight  : 600
Font-size    : 0.95rem
Hover        : opacity 0.85
Active       : transform scale(0.98)
Transisi     : transform 0.1s, opacity 0.2s
```

### Tombol Sekunder — `.tracker-search__submit`

```
Background   : var(--bg-page)  = #F6F7F9
Border       : 1px solid var(--border-light)
Border-radius: 12px
Padding      : 0.85rem 1.25rem
Font-weight  : 600
Font-size    : 0.95rem
Hover        : background #E4E4E7
```

### Tombol Aksi Kecil — `.tracker-transaction-item__btn`

Dipakai untuk tombol Edit, Hapus, Toggle Tipe di setiap kartu transaksi, dan tombol Keluar di header.

```
Background   : var(--bg-page)  = #F6F7F9
Border       : 1px solid var(--border-light)
Border-radius: 6px
Padding      : 0.2rem 0.4rem
Font-size    : 0.75rem
Hover        : background var(--border-light), color var(--text-dark)
```

### Input Form — `.tracker-form__input`

Dipakai di form transaksi, form pencarian, form kategori, dan form auth.

```
Background   : #FCFCFC (default) / #FAFAFA (di dalam .tracker-search)
Border       : 1px solid var(--border-light)
Border-radius: 12px
Padding      : 0.85rem 1rem
Font-size    : 0.95rem
Focus        : border-color var(--accent-blue), background var(--bg-card)
Transisi     : border-color 0.2s
```

### Card Dasar

```
Background   : var(--bg-card)  = #FFFFFF
Border       : 1px solid var(--border-light)
Border-radius: var(--card-radius)  = 20px
Padding      : var(--card-padding)  = 24px
```

Tambahan untuk `.tracker-form-section__card`:
```
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02)
```

### Card Saldo Utama — `.tracker-summary__balance`

```
Background: linear-gradient(145deg, #FFFFFF 40%, #EFF6FF 100%)
```

### Card Chart — `.tracker-chart-card`

```
Background   : var(--bg-card)
Border       : 1px solid var(--border-light)
Border-radius: var(--card-radius)  = 20px
Padding      : var(--card-padding)  = 24px
Canvas max-height: 280px
```

### Kartu Transaksi — `.tracker-transaction-item`

```
Display      : flex, align-items center, gap 1rem
Padding      : 0.75rem 0 (atas-bawah saja)
Border-bottom: 1px solid var(--border-light)
               (item terakhir tidak memiliki border-bottom)
```

Ikon transaksi berukuran 48x48px dengan `border-radius: 16px`:
- Pemasukan: `background #ECFDF5`, `color #10B981`
- Pengeluaran: `background #FFF1F2`, `color #F43F5E`

Judul transaksi menggunakan `white-space: nowrap; overflow: hidden; text-overflow: ellipsis` — judul panjang dipotong dengan ellipsis.

### Chip Kategori — `.tracker-category-chip`

```
Background   : var(--bg-page)  = #F6F7F9
Border       : 1px solid var(--border-light)
Border-radius: 20px (fully rounded pill)
Padding      : 0.4rem 0.6rem 0.4rem 0.9rem
Font-size    : 0.85rem
Display      : flex, align-items center, gap 0.5rem
```

Tombol hapus di dalam chip menggunakan `color: var(--color-expense)` yaitu `#F43F5E`.

### Auth Card — `.auth-card`

```
Background   : var(--bg-card)  = #FFFFFF
Border       : 1px solid var(--border-light)
Border-radius: var(--card-radius)  = 20px
Padding      : 2.5rem
Max-width    : 420px
```

## 6. Responsive Breakpoints

Terdapat tiga breakpoint media query di `style.css`.

### Tablet — `@media (max-width: 1024px)`

| Komponen | Perubahan |
|---|---|
| `.tracker-summary` | Dari `2fr 1.25fr 1.25fr` menjadi `1fr 1fr` |
| `.tracker-summary__balance` | `grid-column: span 2` |
| `.tracker-form` | Dari `2fr 1fr 1fr 1fr auto` menjadi `1fr 1fr` |
| `.tracker-form__field:nth-child(1)` | `grid-column: span 2` |
| `.tracker-form__submit` | `grid-column: span 2` |
| `.tracker-history__grid` | Dari `1fr 1fr` menjadi `1fr` |
| `.tracker-charts__grid` | Dari `1fr 1.5fr` menjadi `1fr` |

### Mobile — `@media (max-width: 768px)`

| Komponen | Perubahan |
|---|---|
| `body` | Padding dikecilkan ke `0.75rem` |
| `.tracker-app`, `main` | Gap dikecilkan ke `1rem` |
| `.tracker-summary` | Satu kolom, gap `1rem` |
| `.tracker-summary__balance-amount` | Font-size `2.25rem`, tambah `word-break: break-all` |
| `.tracker-summary__stat-amount` | Font-size `1.75rem` |
| `.tracker-form` | Berubah ke `flex-direction: column` |
| `.tracker-form__submit` | `width: 100%` |
| `.tracker-search__form` | Berubah ke `flex-direction: column` |
| `.tracker-category-form` | Berubah ke `flex-direction: column` |

### Mobile Kecil — `@media (max-width: 640px)`

| Komponen | Perubahan |
|---|---|
| `.tracker-transaction-item` | `flex-wrap: wrap`, `align-items: flex-start` |
| `.tracker-transaction-item__right` | `width: 100%`, `flex-direction: column` |
| `.tracker-transaction-item__amount` | Tambah `padding-left: 4rem` |
| `.tracker-transaction-item__btn` | `flex: 1`, font-size `0.85rem`, font-weight `500` |

## 7. Catatan dan Asal-Usul

### Asal-usul File CSS

File `style.css` merupakan adaptasi dari starter template yang disediakan dalam submission kelas Front-End Web Pemula Dicoding. Template awal mencakup section ringkasan saldo, form transaksi, dan daftar riwayat.

### Blok CSS yang Ditambahkan Setelah Template Awal

| Blok CSS | Deskripsi |
|---|---|
| `.auth-section`, `.auth-card`, `.auth-form`, `.auth-switch` | Section halaman autentikasi |
| `.tracker-category-section__card`, `.tracker-category-form`, `.tracker-category-list`, `.tracker-category-chip` | Section kelola kategori kustom |
| `.tracker-charts__grid`, `.tracker-chart-card` | Section visualisasi data |
| Responsive rules untuk `.tracker-category-form` | Layout satu kolom di mobile |
| Responsive rules untuk `.tracker-charts__grid` | Layout satu kolom di tablet |

### Yang Tidak Berubah dari Template Awal

Palet warna, tipografi, spacing, dan gaya komponen pada section-section lama (summary, form transaksi, daftar transaksi) tetap konsisten dengan desain starter template asli Dicoding. Tidak ada dark mode, tidak ada animasi kompleks, dan tidak ada CSS custom property tambahan di luar yang sudah ada di `:root`.

---

*Dokumen ini dibuat berdasarkan pembacaan langsung `frontend/style.css` dan `frontend/index.html`. Terakhir diperbarui: 27 Agustus 2026.*
