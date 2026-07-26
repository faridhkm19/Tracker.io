// category.js

// State kategori yang sedang aktif, dipakai bersama oleh main.js untuk mengisi dropdown form transaksi
let categories = [];

const categoryFormEl = document.getElementById('categoryForm');
const categoryNameInputEl = document.getElementById('categoryNameInput');
const categoryTypeSelectEl = document.getElementById('categoryTypeSelect');
const categoryIconInputEl = document.getElementById('categoryIconInput');
const categoryListEl = document.getElementById('categoryList');
const transactionCategorySelectEl = document.getElementById('transactionFormCategorySelect');
const transactionTypeSelectEl = document.getElementById('transactionFormTypeSelect');

// Mengambil seluruh kategori milik user dari API
const fetchCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const result = await response.json();

    if (!response.ok) {
      alert(result.message);
      return;
    }

    categories = result.data;
    renderCategoryList();
    renderCategoryDropdown();
    renderCategoryFilterDropdown();
  } catch (error) {
    alert('Gagal mengambil data kategori. Pastikan server backend berjalan.');
  }
};

// Menampilkan daftar kategori sebagai "chip" di section Kelola Kategori
const renderCategoryList = () => {
  categoryListEl.innerHTML = '';

  categories.forEach((cat) => {
    const chip = document.createElement('div');
    chip.className = 'tracker-category-chip';

    const label = document.createElement('span');
    label.textContent = `${cat.icon || ''} ${cat.name} (${cat.type === 'income' ? 'Masuk' : 'Keluar'})`;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'tracker-category-chip__delete';
    deleteBtn.textContent = '✕';
    deleteBtn.addEventListener('click', () => handleDeleteCategory(cat.id));

    chip.appendChild(label);
    chip.appendChild(deleteBtn);
    categoryListEl.appendChild(chip);
  });
};

// Mengisi ulang dropdown kategori di form transaksi, sesuai tipe yang sedang dipilih
const renderCategoryDropdown = () => {
  const selectedType = transactionTypeSelectEl.value;
  const filtered = categories.filter((cat) => cat.type === selectedType);

  transactionCategorySelectEl.innerHTML = '<option value="">Pilih kategori...</option>';

  filtered.forEach((cat) => {
    const option = document.createElement('option');
    option.value = cat.id;
    option.textContent = `${cat.icon || ''} ${cat.name}`;
    transactionCategorySelectEl.appendChild(option);
  });
};

// Saat tipe transaksi berubah, dropdown kategori otomatis menyesuaikan
transactionTypeSelectEl.addEventListener('change', renderCategoryDropdown);

// Handle submit form tambah kategori
categoryFormEl.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = categoryNameInputEl.value.trim();
  const type = categoryTypeSelectEl.value;
  const icon = categoryIconInputEl.value.trim();

  if (!name) {
    alert('Nama kategori tidak boleh kosong');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ name, type, icon }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.message);
      return;
    }

    categoryFormEl.reset();
    fetchCategories(); // refresh daftar kategori & dropdown
  } catch (error) {
    alert('Gagal menambahkan kategori. Pastikan server backend berjalan.');
  }
});

// Handle hapus kategori
const handleDeleteCategory = async (id) => {
  const confirmed = confirm('Yakin ingin menghapus kategori ini?');
  if (!confirmed) return;

  try {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    const result = await response.json();

    if (!response.ok) {
      // Menangani kasus khusus: kategori masih dipakai transaksi lain (error 409)
      alert(result.message);
      return;
    }

    fetchCategories();
  } catch (error) {
    alert('Gagal menghapus kategori. Pastikan server backend berjalan.');
  }
};

// Mengisi dropdown filter kategori (section pencarian) dengan seluruh kategori,
// berbeda dari renderCategoryDropdown() yang khusus untuk form tambah transaksi
const renderCategoryFilterDropdown = () => {
  const filterCategorySelectEl = document.getElementById('filterCategorySelect');
  filterCategorySelectEl.innerHTML = '<option value="">Semua Kategori</option>';

  categories.forEach((cat) => {
    const option = document.createElement('option');
    option.value = cat.id;
    option.textContent = `${cat.icon || ''} ${cat.name}`;
    filterCategorySelectEl.appendChild(option);
  });
};

document.addEventListener('app:ready', () => {
  fetchCategories();
});