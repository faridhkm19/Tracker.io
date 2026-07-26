require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const pool = require('./src/config/db');

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://127.0.0.1:5500', // fallback untuk development lokal
};

app.set('trust proxy', 1);

// Middleware dasar
app.use(cors(corsOptions));
app.use(express.json({ limit: '100kb' }));

// Endpoint tes 1: memastikan server Express berjalan
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server berjalan dengan baik',
  });
});

// Endpoint tes 2: memastikan koneksi ke MySQL berhasil
app.get('/api/db-test', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    res.status(200).json({
      status: 'success',
      message: 'Koneksi database berhasil',
      data: rows,
    });
  } catch (error) {
    console.error(error); // tetap tercatat di log server Railway untuk kebutuhan debugging
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data transaksi',
    });
  }
});

module.exports = app;

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

const authRoutes = require('./src/routes/authRoutes');

// Tambahkan setelah app.use(express.json())
app.use('/api/auth', authRoutes);

const categoryRoutes = require('./src/routes/categoryRoutes');

// Tambahkan setelah app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);

const transactionRoutes = require('./src/routes/transactionRoutes');

// Tambahkan setelah app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);

const dashboardRoutes = require('./src/routes/dashboardRoutes');

// Tambahkan setelah app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);