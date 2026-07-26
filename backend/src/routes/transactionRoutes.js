const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  toggleTransactionType,
} = require('../controllers/transactionController');

router.use(verifyToken);

router.get('/', getTransactions);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);
router.patch('/:id/toggle-type', toggleTransactionType);

module.exports = router;