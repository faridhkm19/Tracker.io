const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const {
  getSummary,
  getByCategory,
  getMonthlyTrend,
} = require('../controllers/dashboardController');

router.use(verifyToken);

router.get('/summary', getSummary);
router.get('/by-category', getByCategory);
router.get('/monthly-trend', getMonthlyTrend);

module.exports = router;