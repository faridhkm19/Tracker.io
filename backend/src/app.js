require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const pool = require('./config/db');

const app = express();

// Wajib untuk platform dengan reverse proxy
app.set('trust proxy', 1);

// CORS: terima CORS_ORIGIN dari env, fallback ke semua origin untuk debugging
const corsOptions = {
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: process.env.CORS_ORIGIN ? true : false,
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '100kb' }));

// Endpoint tes
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server berjalan dengan baik',
  });
});

app.get('/api/db-test', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    res.status(200).json({
      status: 'success',
      message: 'Koneksi database berhasil',
      data: rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Koneksi database gagal',
    });
  }
});

// Routes utama
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
// Catch-all 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint tidak ditemukan',
    path: req.originalUrl
  });
});

module.exports = app;