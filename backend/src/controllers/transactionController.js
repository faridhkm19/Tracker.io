const pool = require('../config/db');

// GET transaksi dengan dukungan filter
const getTransactions = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { start_date, end_date, category_id, type, keyword } = req.query;

    let query = `
      SELECT t.*, c.name AS category_name, c.icon AS category_icon
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ?
    `;
    const params = [userId];

    if (start_date) {
      query += ' AND t.transaction_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND t.transaction_date <= ?';
      params.push(end_date);
    }
    if (category_id) {
      query += ' AND t.category_id = ?';
      params.push(category_id);
    }
    if (type) {
      query += ' AND t.type = ?';
      params.push(type);
    }
    if (keyword) {
      query += ' AND t.title LIKE ?';
      params.push(`%${keyword}%`);
    }

    query += ' ORDER BY t.transaction_date DESC, t.created_at DESC';

    const [transactions] = await pool.query(query, params);

    res.status(200).json({
      status: 'success',
      data: transactions,
    });
  } catch (error) {
    console.error(error); // tetap tercatat di log server Railway untuk kebutuhan debugging
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data transaksi',
    });
  }
};

// POST tambah transaksi baru
const createTransaction = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { title, amount, type, transaction_date, category_id } = req.body;

    // Validasi dasar
    if (!title || !title.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Keterangan transaksi tidak boleh kosong',
      });
    }
    if (!amount || Number(amount) < 1) {
      return res.status(400).json({
        status: 'error',
        message: 'Nominal transaksi harus berupa angka dan minimal Rp 1',
      });
    }
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({
        status: 'error',
        message: 'Tipe transaksi harus income atau expense',
      });
    }
    if (!category_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Kategori wajib dipilih',
      });
    }

    // Pastikan kategori ada dan milik user ini
    const [category] = await pool.query(
      'SELECT id FROM categories WHERE id = ? AND user_id = ?',
      [category_id, userId]
    );

    if (category.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Kategori tidak ditemukan',
      });
    }

    const [result] = await pool.query(
      'INSERT INTO transactions (user_id, category_id, title, amount, type, transaction_date) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, category_id, title.trim(), amount, type, transaction_date]
    );

    res.status(201).json({
      status: 'success',
      message: 'Transaksi berhasil ditambahkan',
      data: { id: result.insertId },
    });
  } catch (error) {
    console.error(error); // tetap tercatat di log server Railway untuk kebutuhan debugging
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data transaksi',
    });
  }
};

// PUT ubah transaksi
const updateTransaction = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { id } = req.params;
    const { title, amount, type, transaction_date, category_id } = req.body;

    const [existing] = await pool.query(
      'SELECT id FROM transactions WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Transaksi tidak ditemukan',
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Keterangan transaksi tidak boleh kosong',
      });
    }
    if (!amount || Number(amount) < 1) {
      return res.status(400).json({
        status: 'error',
        message: 'Nominal transaksi harus berupa angka dan minimal Rp 1',
      });
    }

    if (category_id) {
      const [category] = await pool.query(
        'SELECT id FROM categories WHERE id = ? AND user_id = ?',
        [category_id, userId]
      );
      if (category.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Kategori tidak ditemukan',
        });
      }
    }

    await pool.query(
      'UPDATE transactions SET title = ?, amount = ?, type = ?, transaction_date = ?, category_id = ? WHERE id = ? AND user_id = ?',
      [title.trim(), amount, type, transaction_date, category_id, id, userId]
    );

    res.status(200).json({
      status: 'success',
      message: 'Transaksi berhasil diperbarui',
    });
  } catch (error) {
    console.error(error); // tetap tercatat di log server Railway untuk kebutuhan debugging
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data transaksi',
    });
  }
};

// DELETE transaksi
const deleteTransaction = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { id } = req.params;

    const [existing] = await pool.query(
      'SELECT id FROM transactions WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Transaksi tidak ditemukan',
      });
    }

    await pool.query('DELETE FROM transactions WHERE id = ? AND user_id = ?', [id, userId]);

    res.status(200).json({
      status: 'success',
      message: 'Transaksi berhasil dihapus',
    });
  } catch (error) {
    console.error(error); // tetap tercatat di log server Railway untuk kebutuhan debugging
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data transaksi',
    });
  }
};

// PATCH ubah tipe transaksi (income <-> expense)
const toggleTransactionType = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { id } = req.params;

    const [existing] = await pool.query(
      'SELECT id, type FROM transactions WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Transaksi tidak ditemukan',
      });
    }

    const newType = existing[0].type === 'income' ? 'expense' : 'income';

    await pool.query(
      'UPDATE transactions SET type = ? WHERE id = ? AND user_id = ?',
      [newType, id, userId]
    );

    res.status(200).json({
      status: 'success',
      message: 'Tipe transaksi berhasil diubah',
      data: { type: newType },
    });
  } catch (error) {
    console.error(error); // tetap tercatat di log server Railway untuk kebutuhan debugging
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data transaksi',
    });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  toggleTransactionType,
};