const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  addPayment,
  getPayments,
  searchPayment,
  getPaymentById,
  updatePayment
} = require('../controllers/payment');

router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.post('/add', addPayment);
router.get('/', getPayments);
router.get('/search', searchPayment);
router.get('/:id', getPaymentById);
router.put('/:id', updatePayment);

module.exports = router;
