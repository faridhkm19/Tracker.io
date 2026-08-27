const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// REGISTER
const register = async (req, res) => {
  try {
    const { full_name, username, email, password } = req.body;

    // Validasi dasar
    if (!full_name || !username || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Semua field wajib diisi',
      });
    }

    // Cek apakah username atau email sudah dipakai
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        status: 'error',
        message: 'Username atau email sudah terdaftar',
      });
    }

    // Hash password sebelum disimpan
    const passwordHash = await bcrypt.hash(password, 10);

    // Simpan user baru
    await pool.query(
      'INSERT INTO users (full_name, username, email, password_hash) VALUES (?, ?, ?, ?)',
      [full_name, username, email, passwordHash]
    );

    res.status(201).json({
      status: 'success',
      message: 'Registrasi berhasil',
    });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal melakukan registrasi',
    });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Username dan password wajib diisi',
      });
    }

    // Cari user berdasarkan username
    const [users] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'Username atau password salah',
      });
    }

    const user = users[0];

    // Bandingkan password yang diketik dengan hash di database
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Username atau password salah',
      });
    }

    // Buat JWT token
    const token = jwt.sign(
      { user_id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      status: 'success',
      message: 'Login berhasil',
      data: {
        token,
        user: {
          id: user.id,
          full_name: user.full_name,
          username: user.username,
          email: user.email,
        },
      },
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal melakukan login',
    });
  }
};

module.exports = { register, login };