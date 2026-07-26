const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message: 'Token tidak ditemukan, silakan login terlebih dahulu',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Menyisipkan user_id ke request untuk dipakai controller lain
    next();
  } catch (error) {
    return res.status(403).json({
      status: 'error',
      message: 'Token tidak valid atau sudah kedaluwarsa',
    });
  }
};

module.exports = verifyToken;