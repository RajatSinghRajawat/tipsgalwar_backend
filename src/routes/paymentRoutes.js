const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  addPayment,
  getPayments,
  searchPayment,
  getPaymentById,
  updatePayment,
  deletePayment,
  generateReceipt
} = require('../controllers/payment');

router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.post('/add', addPayment);
router.get('/', getPayments);
router.get('/search', searchPayment);
router.get('/:id', getPaymentById);
router.put('/:id', updatePayment);
router.delete('/:id', deletePayment);
router.get('/:id/receipt', generateReceipt);

module.exports = router;
