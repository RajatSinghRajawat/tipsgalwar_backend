const crypto = require('crypto');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const Payment = require('../modals/payment');

const getRazorpayInstance = () => {
  const { RAZORPAY_KEY_ID, RAZORPAY_SECRET } = process.env;

  if (!RAZORPAY_KEY_ID || !RAZORPAY_SECRET) {
    throw new Error('Razorpay credentials are missing in environment variables.');
  }

  return new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_SECRET
  });
};

const parseAmount = (amount) => {
  const parsedAmount = Number(amount);

  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return null;
  }

  return parsedAmount;
};

const isValidObjectId = (value) => mongoose.isValidObjectId(value);

const parseBooleanFlag = (value) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalizedValue = value.trim().toLowerCase();

    if (normalizedValue === 'true') {
      return true;
    }

    if (normalizedValue === 'false') {
      return false;
    }
  }

  return Boolean(value);
};

exports.createOrder = async (req, res) => {
  try {
    const {
      amount,
      currency = 'INR',
      student_id,
      emi_discount = 0,
      emi_duedate,
      receipt
    } = req.body;

    const parsedAmount = parseAmount(amount);

    if (!parsedAmount) {
      return res.status(400).json({ message: 'Valid amount is required.' });
    }

    if (student_id && !isValidObjectId(student_id)) {
      return res.status(400).json({ message: 'Invalid student_id.' });
    }

    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create({
      amount: Math.round(parsedAmount * 100),
      currency: String(currency).toUpperCase(),
      receipt: receipt || `receipt_${Date.now()}`
    });

    let payment = null;

    if (student_id) {
      payment = await Payment.create({
        student_id,
        amount: parsedAmount,
        emi_discount,
        emi_duedate: emi_duedate || null,
        razorpay_order_id: order.id,
        currency: order.currency,
        receipt: order.receipt,
        status: 'created',
        is_paid: false
      });
    }

    return res.status(201).json({
      message: 'Order created successfully.',
      order,
      payment
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error creating order.',
      error: error.message
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      student_id,
      amount,
      emi_discount,
      emi_duedate,
      payment_date
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        message: 'razorpay_order_id, razorpay_payment_id and razorpay_signature are required.'
      });
    }

    const secret = process.env.RAZORPAY_SECRET;

    if (!secret) {
      return res.status(500).json({
        message: 'Razorpay secret is missing in environment variables.'
      });
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        message: 'Invalid payment signature.',
        verified: false
      });
    }

    if (student_id && !isValidObjectId(student_id)) {
      return res.status(400).json({ message: 'Invalid student_id.' });
    }

    const parsedAmount = typeof amount === 'undefined' ? null : parseAmount(amount);

    if (typeof amount !== 'undefined' && !parsedAmount) {
      return res.status(400).json({ message: 'Valid amount is required.' });
    }

    let payment = await Payment.findOne({ razorpay_order_id });

    if (payment) {
      payment.txn_id = razorpay_payment_id;
      payment.razorpay_payment_id = razorpay_payment_id;
      payment.razorpay_signature = razorpay_signature;
      payment.is_paid = true;
      payment.status = 'paid';
      payment.payment_date = payment_date || new Date();

      if (student_id) {
        payment.student_id = student_id;
      }

      if (parsedAmount) {
        payment.amount = parsedAmount;
      }

      if (typeof emi_discount !== 'undefined') {
        payment.emi_discount = emi_discount;
      }

      if (typeof emi_duedate !== 'undefined') {
        payment.emi_duedate = emi_duedate || null;
      }

      await payment.save();
    } else if (student_id && parsedAmount) {
      payment = await Payment.create({
        txn_id: razorpay_payment_id,
        student_id,
        amount: parsedAmount,
        is_paid: true,
        emi_discount: emi_discount || 0,
        payment_date: payment_date || new Date(),
        emi_duedate: emi_duedate || null,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        status: 'paid'
      });
    }

    return res.status(200).json({
      message: 'Payment verified successfully.',
      verified: true,
      paymentSaved: Boolean(payment),
      payment
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error verifying payment.',
      error: error.message
    });
  }
};

exports.addPayment = async (req, res) => {
  try {
    const {
      txn_id,
      student_id,
      amount,
      is_paid = false,
      emi_discount = 0,
      payment_date,
      emi_duedate,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      currency = 'INR',
      receipt,
      status
    } = req.body;

    const parsedAmount = parseAmount(amount);
    const paidStatus = parseBooleanFlag(is_paid);

    if (!student_id || !isValidObjectId(student_id)) {
      return res.status(400).json({ message: 'Valid student_id is required.' });
    }

    if (!parsedAmount) {
      return res.status(400).json({ message: 'Valid amount is required.' });
    }

    const payment = await Payment.create({
      txn_id: txn_id || razorpay_payment_id || null,
      student_id,
      amount: parsedAmount,
      is_paid: paidStatus,
      emi_discount,
      payment_date: payment_date || null,
      emi_duedate: emi_duedate || null,
      razorpay_order_id: razorpay_order_id || null,
      razorpay_payment_id: razorpay_payment_id || null,
      razorpay_signature: razorpay_signature || null,
      currency,
      receipt: receipt || null,
      status: status || (paidStatus ? 'paid' : 'created')
    });

    return res.status(201).json({
      message: 'Payment added successfully.',
      payment
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error adding payment.',
      error: error.message
    });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('student_id')
      .sort({ created_at: -1 });

    return res.status(200).json({
      message: 'Payments fetched successfully.',
      count: payments.length,
      payments
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error fetching payments.',
      error: error.message
    });
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid payment id.' });
    }

    const payment = await Payment.findById(id).populate('student_id');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found.' });
    }

    return res.status(200).json({
      message: 'Payment fetched successfully.',
      payment
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error fetching payment.',
      error: error.message
    });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid payment id.' });
    }

    if (req.body.student_id && !isValidObjectId(req.body.student_id)) {
      return res.status(400).json({ message: 'Invalid student_id.' });
    }

    if (typeof req.body.amount !== 'undefined') {
      const parsedAmount = parseAmount(req.body.amount);

      if (!parsedAmount) {
        return res.status(400).json({ message: 'Valid amount is required.' });
      }

      req.body.amount = parsedAmount;
    }

    if (typeof req.body.is_paid !== 'undefined') {
      req.body.is_paid = parseBooleanFlag(req.body.is_paid);
    }

    const updated = await Payment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('student_id');

    if (!updated) {
      return res.status(404).json({ message: 'Payment not found.' });
    }

    return res.status(200).json({
      message: 'Payment updated successfully.',
      payment: updated
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error updating payment.',
      error: error.message
    });
  }
};

exports.searchPayment = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required.' });
    }

    const filters = [
      { txn_id: { $regex: query, $options: 'i' } },
      { razorpay_order_id: { $regex: query, $options: 'i' } },
      { razorpay_payment_id: { $regex: query, $options: 'i' } }
    ];

    if (isValidObjectId(query)) {
      filters.push({ student_id: query });
    }

    const payments = await Payment.find({ $or: filters })
      .populate('student_id')
      .sort({ created_at: -1 });

    return res.status(200).json({
      message: 'Payment search completed successfully.',
      count: payments.length,
      payments
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error searching payments.',
      error: error.message
    });
  }
};
