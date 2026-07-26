const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // jendela waktu 15 menit
  max: 10, // maksimal 10 percobaan per IP dalam jendela waktu tersebut
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Terlalu banyak percobaan login. Silakan coba lagi dalam beberapa menit.',
  },
});

module.exports = loginLimiter;