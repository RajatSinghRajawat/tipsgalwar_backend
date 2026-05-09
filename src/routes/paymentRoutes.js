const express = require('express');

const router = express.Router();

const {
  addPayment,
  getPayments,
  searchPayment,
  getPaymentById,
  updatePayment,
  deletePayment,
  generateReceipt
} = require('../controllers/payment');

/* =========================================================
   PAYMENT CRUD ROUTES
========================================================= */

// Add Payment
router.post('/add', addPayment);

// Get All Payments
router.get('/', getPayments);

// Search Payments
router.get('/search', searchPayment);

// Get Single Payment
router.get('/:id', getPaymentById);

// Update Payment
router.put('/:id', updatePayment);

// Delete Payment
router.delete('/:id', deletePayment);

// Download Receipt PDF
router.get('/:id/receipt', generateReceipt);

module.exports = router;