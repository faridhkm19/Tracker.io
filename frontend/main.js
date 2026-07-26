/**
 * ========================================================
 * Expense Tracker App — main.js
 * ========================================================
 * Versi terhubung ke Backend API (MySQL), migrasi dari localStorage.
 */

// UTILITAS
// Membuat format angka menjadi format mata uang Rupiah Indonesia
const formatRupiah = (amount) =>
    'Rp ' + Number(amount).toLocaleString('id-ID');
// Memformat string tanggal (YYYY-MM-DD) menjadi format lokal Indonesia.
const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    // MySQL mengembalikan DATE sebagai ISO datetime string (e.g. "2026-07-23T17:00:00.000Z")
    // Ambil hanya 10 karakter pertama agar konsisten dalam format YYYY-MM-DD
    const datePart = String(dateStr).substring(0, 10);
    const [year, month, day] = datePart.split('-');
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

// Array transaksi kini hanya berfungsi sebagai cache hasil fetch terakhir dari server,
// BUKAN lagi sumber penyimpanan utama (sumber utama ada di database MySQL).
let transactions = [];

// generateId() sudah TIDAK dipakai lagi karena ID kini dibuat otomatis oleh MySQL
// (AUTO_INCREMENT), bukan lagi dibuat manual di sisi client.
// const generateId = () => +new Date();

/**
 * ========================================================
 * Kriteria 1: Memanipulasi DOM untuk Form dan Daftar Transaksi
 * ========================================================
 */
const incomeListEl   = document.getElementById('incomeList');
const expenseListEl  = document.getElementById('expenseList');
const formEl         = document.getElementById('transactionForm');
const titleInputEl   = document.getElementById('transactionFormTitleInput');
const amountInputEl  = document.getElementById('transactionFormAmountInput');
const dateInputEl    = document.getElementById('transactionFormDateInput');
const typeSelectEl   = document.getElementById('transactionFormTypeSelect');
const categorySelectEl = document.getElementById('transactionFormCategorySelect'); // baru dari Tahap 7b
const submitBtnEl    = document.querySelector('[data-testid="transactionFormSubmitButton"]');
const formHeadingEl  = document.getElementById('form-heading');

/**
 * Menampilkan (render) semua transaksi ke layar.
 * Struktur fungsi ini TIDAK BERUBAH dari versi localStorage, hanya menambahkan
 * penyesuaian nama field dari API (transaction_date) dan penampilan kategori.
 */
const renderTransactions = (data = transactions) => {
    // Kosongkan kedua kontainer sebelum mengisi ulang
    incomeListEl.innerHTML  = '';
    expenseListEl.innerHTML = '';

    data.forEach((transaction) => {
        const {
            id,
            title,
            amount,
            transaction_date: date, // field dari API bernama transaction_date, bukan date
            type,
            category_name,
            category_icon,
        } = transaction;

        const isIncome  = type === 'income';
        const typeLabel = isIncome ? 'Pemasukan' : 'Pengeluaran';
        const iconLabel = category_icon || (isIncome ? '💰' : '💸');

        // Buat elemen kartu dengan document.createElement()
        const card = document.createElement('div');
        card.setAttribute('data-testid', 'transactionItem');
        card.className = 'tracker-transaction-item';

        // Ikon
        const icon = document.createElement('div');
        icon.className = `tracker-transaction-item__icon tracker-transaction-item__icon--${type}`;
        icon.textContent = iconLabel;
        icon.setAttribute('aria-hidden', 'true');

        // Detail kiri (judul, tanggal, kategori)
        const detail = document.createElement('div');
        detail.className = 'tracker-transaction-item__detail';

        const titleEl = document.createElement('h3');
        titleEl.setAttribute('data-testid', 'transactionItemTitle');
        titleEl.className = 'tracker-transaction-item__title';
        titleEl.textContent = title;

        const dateEl = document.createElement('p');
        dateEl.setAttribute('data-testid', 'transactionItemDate');
        dateEl.className = 'tracker-transaction-item__date';
        dateEl.textContent = `Tanggal: ${formatDate(date)}`;

        // Tambahan baru: menampilkan nama kategori transaksi
        const categoryEl = document.createElement('p');
        categoryEl.className = 'tracker-transaction-item__date';
        categoryEl.textContent = `Kategori: ${category_name || '-'}`;

        detail.appendChild(titleEl);
        detail.appendChild(dateEl);
        detail.appendChild(categoryEl);

        // Sisi kanan (nominal, tipe, tombol aksi)
        const right = document.createElement('div');
        right.className = 'tracker-transaction-item__right';

        const amountEl = document.createElement('p');
        amountEl.setAttribute('data-testid', 'transactionItemAmount');
        amountEl.className = `tracker-transaction-item__amount tracker-transaction-item__amount--${type}`;
        amountEl.textContent = `Nominal: ${formatRupiah(amount)}`;

        const typeEl = document.createElement('p');
        typeEl.setAttribute('data-testid', 'transactionItemType');
        typeEl.className = 'tracker-transaction-item__date';
        typeEl.textContent = `Tipe: ${typeLabel}`;

        // Grup tombol aksi
        const actions = document.createElement('div');
        actions.className = 'tracker-transaction-item__actions';

        // Tombol "Ubah Tipe"
        const toggleBtn = document.createElement('button');
        toggleBtn.setAttribute('data-testid', 'transactionItemEditTypeButton');
        toggleBtn.className = 'tracker-transaction-item__btn';
        toggleBtn.textContent = 'Ubah Tipe';
        toggleBtn.addEventListener('click', () => handleToggleType(id));

        // Tombol "Edit"
        const editBtn = document.createElement('button');
        editBtn.setAttribute('data-testid', 'transactionItemEditButton');
        editBtn.className = 'tracker-transaction-item__btn';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => handleEdit(id));

        // Tombol "Hapus"
        const deleteBtn = document.createElement('button');
        deleteBtn.setAttribute('data-testid', 'transactionItemDeleteButton');
        deleteBtn.className = 'tracker-transaction-item__btn';
        deleteBtn.textContent = 'Hapus';
        deleteBtn.addEventListener('click', () => handleDelete(id));

        actions.appendChild(toggleBtn);
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);

        right.appendChild(amountEl);
        right.appendChild(typeEl);
        right.appendChild(actions);

        // Rakit seluruh bagian kartu
        card.appendChild(icon);
        card.appendChild(detail);
        card.appendChild(right);

        // Masukkan kartu ke kontainer yang tepat: income → incomeList, expense → expenseList
        if (type === 'income') {
            incomeListEl.appendChild(card);
        } else {
            expenseListEl.appendChild(card);
        }
    });
};

// State mode edit & kata kunci pencarian
// ID Transaksi yang sedang diedit. Bernilai null saat mode "Tambah"
let editingId = null;

// Kata kunci pencarian aktif. String kosong berarti tampilkan semua.
let searchKeyword = '';

// Mengosongkan form dan mengembalikan ke mode "Tambah Baru".
const resetForm = () => {
    editingId = null;
    formEl.reset();
    formHeadingEl.textContent = 'Tambah Pencatatan Baru';
    submitBtnEl.textContent   = 'Simpan';
};

/**
 * ========================================================
 * FETCH — Mengambil Data dari Backend (menggantikan loadTransactions())
 * ========================================================
 */

// Menggantikan loadTransactions(). Mendukung filter opsional (dipakai penuh di Tahap 7e).
const fetchTransactions = async (filters = {}) => {
    try {
        const params = new URLSearchParams(filters).toString();
        const url = `${API_BASE_URL}/transactions${params ? '?' + params : ''}`;

        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${getToken()}` },
        });
        const result = await response.json();

        if (!response.ok) {
            alert(result.message);
            return;
        }

        transactions = result.data;
        renderTransactions(transactions);
    } catch (error) {
        alert('Gagal mengambil data transaksi. Pastikan server backend berjalan.');
    }
};

/**
 * Menggantikan updateDashboard() versi lama. Kini mengambil angka jadi dari
 * endpoint agregasi backend (SUM di level SQL), bukan dihitung manual dari
 * array transactions di client.
 */
const balanceEl      = document.querySelector('.tracker-summary__balance-amount');
const totalIncomeEl  = document.querySelector('.tracker-summary__stat-amount--income');
const totalExpenseEl = document.querySelector('.tracker-summary__stat-amount--expense');

const fetchDashboardSummary = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/summary`, {
            headers: { Authorization: `Bearer ${getToken()}` },
        });
        const result = await response.json();

        if (!response.ok) return;

        balanceEl.textContent      = formatRupiah(result.data.balance);
        totalIncomeEl.textContent  = formatRupiah(result.data.total_income);
        totalExpenseEl.textContent = formatRupiah(result.data.total_expense);
    } catch (error) {
        console.error('Gagal mengambil ringkasan dashboard:', error);
    }
};

/**
 * ========================================================
 * CREATE & UPDATE — Submit Form Transaksi
 * ========================================================
 */
formEl.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Ambil nilai dari setiap input
    const title       = titleInputEl.value.trim();
    const amount      = Number(amountInputEl.value);
    const date        = dateInputEl.value;
    const type        = typeSelectEl.value;
    const category_id = categorySelectEl.value;

    // Validasi sisi client untuk UX cepat (validasi utama & final tetap ditegakkan di server)
    if (!title) {
        alert('Keterangan transaksi tidak boleh kosong.');
        titleInputEl.focus();
        return;
    }
    if (!amount || amount < 1) {
        alert('Nominal transaksi harus berupa angka dan minimal Rp 1.');
        amountInputEl.focus();
        return;
    }
    if (!category_id) {
        alert('Kategori wajib dipilih.');
        categorySelectEl.focus();
        return;
    }

    const payload = {
        title,
        amount,
        type,
        transaction_date: date,
        category_id,
    };

    try {
        let response;

        if (editingId !== null) {
            // Mode Edit: kirim PUT ke transaksi yang sedang diedit
            response = await fetch(`${API_BASE_URL}/transactions/${editingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify(payload),
            });
        } else {
            // Mode Tambah: kirim POST untuk membuat transaksi baru
            response = await fetch(`${API_BASE_URL}/transactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify(payload),
            });
        }

        const result = await response.json();

        if (!response.ok) {
            alert(result.message);
            return;
        }

        // Kirim Custom Event agar tampilan & dasbor diperbarui setelah server sukses merespons
        resetForm();
        document.dispatchEvent(new Event('transaction:updated'));
    } catch (error) {
        alert('Gagal menyimpan transaksi. Pastikan server backend berjalan.');
    }
});

/**
 * ========================================================
 * Kriteria 2 (versi API): Sinkronisasi Data lewat Backend
 * ========================================================
 * localStorage TIDAK LAGI dipakai untuk menyimpan data transaksi.
 * STORAGE_KEY, saveTransactions(), dan loadTransactions() versi lama
 * sudah dihapus total, digantikan fetchTransactions() di atas.
 */

// Menghapus transaksi berdasarkan ID lewat API, lalu perbarui tampilan.
const handleDelete = async (id) => {
    const confirmed = confirm('Yakin ingin menghapus transaksi ini?');
    if (!confirmed) return;

    try {
        const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${getToken()}` },
        });
        const result = await response.json();

        if (!response.ok) {
            alert(result.message);
            return;
        }

        // Jika transaksi yang dihapus sedang dalam mode edit, reset form
        if (editingId === id) resetForm();

        document.dispatchEvent(new Event('transaction:updated'));
    } catch (error) {
        alert('Gagal menghapus transaksi. Pastikan server backend berjalan.');
    }
};

/**
 * Tombol "Edit" berfungsi: saat ditekan, formulir (#transactionForm) secara
 * otomatis terisi dengan data transaksi yang dipilih, termasuk dropdown kategori.
 */
const handleEdit = (id) => {
    const target = transactions.find((t) => t.id === id);
    if (!target) return;

    // Isi setiap field form dengan data transaksi yang dipilih
    editingId           = id;
    titleInputEl.value  = target.title;
    amountInputEl.value = target.amount;
    dateInputEl.value   = target.transaction_date ? target.transaction_date.substring(0, 10) : '';
    typeSelectEl.value  = target.type;

    // Render ulang dropdown kategori sesuai tipe SEBELUM mengisi nilainya,
    // karena dropdown kategori bersifat reaktif terhadap tipe (lihat category.js)
    renderCategoryDropdown();
    categorySelectEl.value = target.category_id;

    // Ubah heading dan label tombol ke mode "Edit"
    formHeadingEl.textContent = 'Ubah Pencatatan';
    submitBtnEl.textContent   = 'Perbarui';

    // Gulir halaman ke form agar pengguna sadar form sudah terisi
    formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/**
 * Custom Event sebagai penghubung antara perubahan data dan pembaruan tampilan.
 * Bedanya dari versi localStorage: sinyal ini kini dikirim SETELAH request ke
 * server berhasil (bukan langsung setelah operasi lokal), dan listener-nya
 * mengambil ulang data terbaru dari server (bukan hanya merender ulang array lokal).
 */
document.addEventListener('transaction:updated', () => {
    fetchTransactions({ keyword: searchKeyword });
    fetchDashboardSummary();
});

/**
 * ========================================================
 * Kriteria 3: Fitur Interaktif (Pindah Kategori dan Pencarian)
 * ========================================================
 */

// Tombol "Ubah Tipe": kini memanggil endpoint PATCH toggle-type ke server
const handleToggleType = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/transactions/${id}/toggle-type`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${getToken()}` },
        });
        const result = await response.json();

        if (!response.ok) {
            alert(result.message);
            return;
        }

        document.dispatchEvent(new Event('transaction:updated'));
    } catch (error) {
        alert('Gagal mengubah tipe transaksi. Pastikan server backend berjalan.');
    }
};

/**
 * Pencarian real-time: kini memanggil fetchTransactions() dengan query
 * parameter keyword, bukan lagi memfilter array lokal secara langsung.
 * (Akan disempurnakan penuh dengan filter tanggal & kategori di Tahap 7e)
 */
const searchInputEl = document.getElementById('searchTransactionFormTitleInput');
const searchFormEl  = document.getElementById('searchTransactionForm');
const filterStartDateEl = document.getElementById('filterStartDate');
const filterEndDateEl = document.getElementById('filterEndDate');
const filterCategorySelectEl = document.getElementById('filterCategorySelect');
const resetFilterBtnEl = document.getElementById('resetFilterBtn');

// Mengumpulkan seluruh kriteria filter yang sedang aktif menjadi satu objek,
// hanya menyertakan field yang benar-benar diisi (agar query API tetap bersih)
const getActiveFilters = () => {
  const filters = {};

  if (searchKeyword.trim()) filters.keyword = searchKeyword.trim();
  if (filterStartDateEl.value) filters.start_date = filterStartDateEl.value;
  if (filterEndDateEl.value) filters.end_date = filterEndDateEl.value;
  if (filterCategorySelectEl.value) filters.category_id = filterCategorySelectEl.value;

  return filters;
};

// Pencarian real-time saat mengetik keyword (tetap dipertahankan dari Tahap 7c)
searchInputEl.addEventListener('input', (e) => {
    searchKeyword = e.target.value;
    fetchTransactions(getActiveFilters());
});

// Submit form (baik lewat tombol "Cari" maupun tekan Enter) menggabungkan seluruh filter
searchFormEl.addEventListener('submit', (e) => {
    e.preventDefault();
    searchKeyword = searchInputEl.value;
    fetchTransactions(getActiveFilters());
});

// Filter tanggal & kategori langsung memicu pencarian ulang saat diubah,
// tanpa perlu menekan tombol "Cari"
filterStartDateEl.addEventListener('change', () => fetchTransactions(getActiveFilters()));
filterEndDateEl.addEventListener('change', () => fetchTransactions(getActiveFilters()));
filterCategorySelectEl.addEventListener('change', () => fetchTransactions(getActiveFilters()));

// Tombol Reset: mengosongkan seluruh filter dan menampilkan ulang semua transaksi
resetFilterBtnEl.addEventListener('click', () => {
  searchFormEl.reset();
  searchKeyword = '';
  fetchTransactions();
});

/**
 * ========================================================
 * INISIALISASI
 * ========================================================
 * Tidak lagi memuat dari localStorage maupun memanggil fetch secara langsung
 * di sini. Sebagai gantinya, kita menunggu sinyal 'app:ready' yang dikirim oleh
 * auth.js SETELAH login berhasil dan token dipastikan tersedia, supaya tidak
 * terjadi error 401 akibat fetch dilakukan sebelum token ada.
 */
document.addEventListener('app:ready', () => {
    fetchTransactions();
    fetchDashboardSummary();
});

// Di dalam listener 'transaction:updated'
document.addEventListener('transaction:updated', () => {
    fetchTransactions({ keyword: searchKeyword });
    fetchDashboardSummary();
    refreshCharts(); // baris tambahan
});

// Di dalam listener 'app:ready'
document.addEventListener('app:ready', () => {
    fetchTransactions();
    fetchDashboardSummary();
    refreshCharts(); // baris tambahan
});