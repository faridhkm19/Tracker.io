const pool = require('../config/db');

// GET semua kategori milik user, opsional filter by type
const getCategories = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { type } = req.query;

    let query = 'SELECT * FROM categories WHERE user_id = ?';
    const params = [userId];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY created_at DESC';

    const [categories] = await pool.query(query, params);

    res.status(200).json({
      status: 'success',
      data: categories,
    });
  } catch (error) {
    console.error(error); // log error untuk debugging
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data transaksi',
    });
  }
};

// POST tambah kategori baru
const createCategory = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { name, type, icon } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        status: 'error',
        message: 'Nama dan tipe kategori wajib diisi',
      });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({
        status: 'error',
        message: 'Tipe kategori harus income atau expense',
      });
    }

    const [result] = await pool.query(
      'INSERT INTO categories (user_id, name, type, icon) VALUES (?, ?, ?, ?)',
      [userId, name, type, icon || null]
    );

    res.status(201).json({
      status: 'success',
      message: 'Kategori berhasil ditambahkan',
      data: { id: result.insertId, name, type, icon },
    });
  } catch (error) {
    console.error(error); // log error untuk debugging
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data transaksi',
    });
  }
};

// PUT ubah kategori
const updateCategory = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { id } = req.params;
    const { name, type, icon } = req.body;

    // Pastikan kategori memang milik user ini
    const [existing] = await pool.query(
      'SELECT id FROM categories WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Kategori tidak ditemukan',
      });
    }

    if (type && !['income', 'expense'].includes(type)) {
      return res.status(400).json({
        status: 'error',
        message: 'Tipe kategori harus income atau expense',
      });
    }

    await pool.query(
      'UPDATE categories SET name = ?, type = ?, icon = ? WHERE id = ? AND user_id = ?',
      [name, type, icon || null, id, userId]
    );

    res.status(200).json({
      status: 'success',
      message: 'Kategori berhasil diperbarui',
    });
  } catch (error) {
    console.error(error); // log error untuk debugging
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data transaksi',
    });
  }
};

// DELETE kategori, ditolak jika masih dipakai transaksi
const deleteCategory = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { id } = req.params;

    // Pastikan kategori memang milik user ini
    const [existing] = await pool.query(
      'SELECT id FROM categories WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Kategori tidak ditemukan',
      });
    }

    // Cek apakah kategori masih dipakai transaksi manapun
    const [usageCheck] = await pool.query(
      'SELECT COUNT(*) AS total FROM transactions WHERE category_id = ?',
      [id]
    );

    if (usageCheck[0].total > 0) {
      return res.status(409).json({
        status: 'error',
        message: 'Kategori ini masih digunakan oleh transaksi lain. Pindahkan transaksi terkait terlebih dahulu.',
      });
    }

    await pool.query('DELETE FROM categories WHERE id = ? AND user_id = ?', [id, userId]);

    res.status(200).json({
      status: 'success',
      message: 'Kategori berhasil dihapus',
    });
  } catch (error) {
    console.error(error); // log error untuk debugging
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data transaksi',
    });
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
