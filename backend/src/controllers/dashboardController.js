const pool = require('../config/db');

// Ringkasan total saldo, pemasukan, pengeluaran
const getSummary = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { start_date, end_date } = req.query;

    let query = `
      SELECT 
        type,
        SUM(amount) AS total
      FROM transactions
      WHERE user_id = ?
    `;
    const params = [userId];

    if (start_date) {
      query += ' AND transaction_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND transaction_date <= ?';
      params.push(end_date);
    }

    query += ' GROUP BY type';

    const [rows] = await pool.query(query, params);

    // Ubah hasil GROUP BY menjadi objek yang mudah dipakai frontend
    let totalIncome = 0;
    let totalExpense = 0;

    rows.forEach((row) => {
      if (row.type === 'income') totalIncome = Number(row.total);
      if (row.type === 'expense') totalExpense = Number(row.total);
    });

    const balance = totalIncome - totalExpense;

    res.status(200).json({
      status: 'success',
      data: {
        total_income: totalIncome,
        total_expense: totalExpense,
        balance,
      },
    });
  } catch (error) {
    console.error(error); // log error untuk debugging
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data transaksi',
    });
  }
};

// Agregasi nominal per kategori (untuk pie chart)
const getByCategory = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { type } = req.query;

    let query = `
      SELECT 
        c.id AS category_id,
        c.name AS category_name,
        c.icon AS category_icon,
        c.type,
        SUM(t.amount) AS total
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ?
    `;
    const params = [userId];

    if (type) {
      query += ' AND t.type = ?';
      params.push(type);
    }

    query += ' GROUP BY c.id, c.name, c.icon, c.type ORDER BY total DESC';

    const [rows] = await pool.query(query, params);

    res.status(200).json({
      status: 'success',
      data: rows,
    });
  } catch (error) {
    console.error(error); // log error untuk debugging
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data transaksi',
    });
  }
};

// Agregasi per bulan (untuk tren chart)
const getMonthlyTrend = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const query = `
      SELECT 
        DATE_FORMAT(transaction_date, '%Y-%m') AS month,
        type,
        SUM(amount) AS total
      FROM transactions
      WHERE user_id = ?
      GROUP BY month, type
      ORDER BY month ASC
    `;

    const [rows] = await pool.query(query, [userId]);

    // Susun ulang menjadi format per bulan: { month, income, expense }
    const trendMap = {};

    rows.forEach((row) => {
      if (!trendMap[row.month]) {
        trendMap[row.month] = { month: row.month, income: 0, expense: 0 };
      }
      trendMap[row.month][row.type] = Number(row.total);
    });

    const trendData = Object.values(trendMap);

    res.status(200).json({
      status: 'success',
      data: trendData,
    });
  } catch (error) {
    console.error(error); // log error untuk debugging
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data transaksi',
    });
  }
};

module.exports = { getSummary, getByCategory, getMonthlyTrend };
