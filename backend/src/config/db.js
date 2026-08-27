const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  // Serverless: 1 koneksi cukup, agar tidak melebihi limit Aiven free tier
  connectionLimit: 1,
  queueLimit: 0,
  connectTimeout: 15000,
  // rejectUnauthorized: false lebih kompatibel di Vercel + Aiven
  ssl: {
    rejectUnauthorized: false,
  },
  // Penting: matikan keepalive agar serverless function bisa terminate
  enableKeepAlive: false,
});

module.exports = pool;