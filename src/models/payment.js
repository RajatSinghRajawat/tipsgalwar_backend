const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  txn_id: {
    type: String,
    trim: true,
    default: null
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Students',
    required: true
  },
  is_paid: {
    type: Boolean,
    required: true,
    default: false
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  emi_discount: {
    type: Number,
    default: 0,
    min: 0
  },
  emi_type: {
    type: String,
    enum: ['monthly', 'quarterly', 'semester', 'yearly'],
    default: null
  },
  emi_number: {
    type: Number,
    default: 1,
    min: 1
  },
  total_emis: {
    type: Number,
    default: 1,
    min: 1
  },
  payment_date: {
    type: Date,
    default: null
  },
  emi_duedate: {
    type: Date,
    default: null
  },
  razorpay_order_id: {
    type: String,
    trim: true,
    default: null
  },
  razorpay_payment_id: {
    type: String,
    trim: true,
    default: null
  },
  razorpay_signature: {
    type: String,
    trim: true,
    default: null
  },
  currency: {
    type: String,
    trim: true,
    uppercase: true,
    default: 'INR'
  },
  receipt: {
    type: String,
    trim: true,
    default: null
  },
  status: {
    type: String,
    enum: ['created', 'paid', 'failed'],
    default: 'created'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);

module.exports = Payment;
