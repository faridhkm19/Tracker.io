// auth.js

const authSection = document.getElementById('authSection');
const appSection = document.getElementById('appSection');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegisterLink = document.getElementById('showRegisterLink');
const showLoginLink = document.getElementById('showLoginLink');
const logoutBtn = document.getElementById('logoutBtn');

// Kunci localStorage untuk menyimpan token (menggantikan STORAGE_KEY transaksi lama)
const TOKEN_KEY = 'expense-tracker-token';
const USER_KEY = 'expense-tracker-user';

// Toggle antara form Login dan Register
showRegisterLink.addEventListener('click', (e) => {
  e.preventDefault();
  loginForm.style.display = 'none';
  registerForm.style.display = 'flex';
});

showLoginLink.addEventListener('click', (e) => {
  e.preventDefault();
  registerForm.style.display = 'none';
  loginForm.style.display = 'flex';
});

// Handle submit Register
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const full_name = document.getElementById('registerFullName').value.trim();
  const username = document.getElementById('registerUsername').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name, username, email, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.message);
      return;
    }

    alert('Registrasi berhasil! Silakan masuk dengan akun barumu.');
    registerForm.reset();
    registerForm.style.display = 'none';
    loginForm.style.display = 'flex';
  } catch (error) {
    alert('Gagal terhubung ke server. Pastikan backend sedang berjalan.');
  }
});

// Handle submit Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.message);
      return;
    }

    // Simpan token dan data user ke localStorage
    localStorage.setItem(TOKEN_KEY, result.data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(result.data.user));

    loginForm.reset();
    showApp();
  } catch (error) {
    alert('Gagal terhubung ke server. Pastikan backend sedang berjalan.');
  }
});

// Handle Logout
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  showAuth();
});

// Menampilkan section App, menyembunyikan Auth
const showApp = () => {
  authSection.style.display = 'none';
  appSection.style.display = 'flex';

  const user = JSON.parse(localStorage.getItem(USER_KEY));
  document.querySelector('.tracker-header__greeting').innerHTML =
    `Halo, <strong>${user.full_name} (${user.username})</strong>`;
  
  // Beri sinyal ke main.js bahwa user siap, agar data awal (kategori, transaksi) di-fetch
  document.dispatchEvent(new Event('app:ready'));
};

// Menampilkan section Auth, menyembunyikan App
const showAuth = () => {
  appSection.style.display = 'none';
  authSection.style.display = 'flex';
};

// Fungsi utilitas untuk dipakai file JS lain: ambil token untuk header Authorization
const getToken = () => localStorage.getItem(TOKEN_KEY);

// Pengecekan saat halaman pertama kali dibuka
const initAuth = () => {
  const token = getToken();
  if (token) {
    showApp();
  } else {
    showAuth();
  }
};

window.addEventListener('load', initAuth);