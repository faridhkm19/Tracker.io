const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  // Serverless: batasi koneksi agar tidak melebihi limit Aiven free tier
  connectionLimit: 1,
  queueLimit: 0,
  connectTimeout: 10000, // 10 detik timeout koneksi
  // SSL wajib untuk Aiven MySQL
  ssl: {
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2',
  },
});

module.exports = pool;