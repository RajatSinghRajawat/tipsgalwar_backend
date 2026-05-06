const crypto = require('crypto');
const axios = require('axios');
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Payment = require('../models/payment');

const getRazorpayCredentials = () => {
const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials are missing in environment variables.');
  }

  return {
    keyId: RAZORPAY_KEY_ID,
    keySecret: RAZORPAY_KEY_SECRET
  };
};

const parseAmount = (amount) => {
  const parsedAmount = Number(amount);

  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return null;
  }

  return parsedAmount;
};

const isValidObjectId = (value) => mongoose.isValidObjectId(value);

const sanitizeReceipt = (value) => {
  const normalizedReceipt = String(value || '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 40);

  return normalizedReceipt || `receipt_${Date.now()}`;
};

const createRazorpayOrder = async ({ amount, currency, receipt }) => {
  const { keyId, keySecret } = getRazorpayCredentials();

  const response = await axios.post(
    'https://api.razorpay.com/v1/orders',
    {
      amount: Math.round(amount * 100),
      currency: String(currency).toUpperCase(),
      receipt: sanitizeReceipt(receipt)
    },
    {
      auth: {
        username: keyId,
        password: keySecret
      },
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    }
  );

  return {
    key: keyId,
    order: response.data
  };
};

const formatPaymentError = (error, fallbackMessage) => {
  const errorCode = error?.code || error?.cause?.code || null;
  const networkCodes = new Set([
    'EACCES',
    'EAI_AGAIN',
    'ECONNABORTED',
    'ECONNREFUSED',
    'ENETUNREACH',
    'ENOTFOUND',
    'ETIMEDOUT'
  ]);

  if (
    networkCodes.has(errorCode) ||
    error?.message === "Cannot read properties of undefined (reading 'status')"
  ) {
    return {
      statusCode: 503,
      message:
        'Could not reach Razorpay from the backend. Check the server internet connection, firewall, or proxy settings.',
      details: errorCode || error?.message || null
    };
  }

  const razorpayDetails =
    error?.response?.data?.error ||
    error?.error ||
    null;

  const specificMessage =
    razorpayDetails?.description ||
    razorpayDetails?.reason ||
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage;

  return {
    statusCode: error?.statusCode || error?.response?.status || 500,
    message: specificMessage,
    details: razorpayDetails || null
  };
};

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

const generateReceiptPDF = (payment, student) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header
      doc.fontSize(20).text('TIPS GALWAR - Payment Receipt', { align: 'center' });
      doc.moveDown();

      // Receipt details
      doc.fontSize(12);
      doc.text(`Receipt No: ${payment.receipt || payment._id}`);
      doc.text(`Date: ${new Date(payment.payment_date || payment.created_at).toLocaleDateString()}`);
      doc.moveDown();

      // Student details
      doc.fontSize(14).text('Student Details:', { underline: true });
      doc.fontSize(12);
      doc.text(`Name: ${student.name}`);
      doc.text(`Enrollment ID: ${student.enrollment_Id}`);
      doc.text(`Email: ${student.email}`);
      doc.text(`Contact: ${student.contact}`);
      doc.moveDown();

      // Payment details
      doc.fontSize(14).text('Payment Details:', { underline: true });
      doc.fontSize(12);
      doc.text(`EMI Type: ${payment.emi_type || 'N/A'}`);
      doc.text(`EMI Number: ${payment.emi_number || 1} of ${payment.total_emis || 1}`);
      doc.text(`Amount Paid: ₹${payment.amount}`);
      if (payment.emi_discount > 0) {
        doc.text(`EMI Discount: ₹${payment.emi_discount}`);
        doc.text(`Net Amount: ₹${payment.amount - payment.emi_discount}`);
      }
      doc.text(`Transaction ID: ${payment.txn_id || payment.razorpay_payment_id || 'N/A'}`);
      doc.moveDown();

      // Next payment info
      if (payment.emi_duedate) {
        doc.fontSize(14).text('Next Payment Due:', { underline: true });
        doc.fontSize(12);
        doc.text(`Due Date: ${new Date(payment.emi_duedate).toLocaleDateString()}`);
        doc.text(`Next EMI Number: ${payment.emi_number + 1}`);
        doc.text(`Amount Due: ₹${payment.amount}`);
      }

      // Footer
      doc.moveDown(2);
      doc.fontSize(10).text('Thank you for your payment!', { align: 'center' });
      doc.text('TIPS GALWAR Institute', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

const calculateEMIDetails = async (student_id, emi_type) => {
  // Get all payments for this student
  const payments = await Payment.find({ 
    student_id, 
    is_paid: true 
  }).sort({ payment_date: 1 });

  const emi_number = payments.length + 1;
  
  // Calculate total EMIs based on course duration (this is a simple assumption)
  // In a real app, this should come from course/batch configuration
  let total_emis = 12; // default monthly
  if (emi_type === 'quarterly') total_emis = 4;
  else if (emi_type === 'semester') total_emis = 2;
  else if (emi_type === 'yearly') total_emis = 1;

  // Calculate next due date
  let nextDueDate = null;
  if (emi_number < total_emis) {
    const lastPaymentDate = payments.length > 0 ? 
      new Date(payments[payments.length - 1].payment_date) : new Date();
    
    if (emi_type === 'monthly') {
      nextDueDate = new Date(lastPaymentDate);
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);
    } else if (emi_type === 'quarterly') {
      nextDueDate = new Date(lastPaymentDate);
      nextDueDate.setMonth(nextDueDate.getMonth() + 3);
    } else if (emi_type === 'semester') {
      nextDueDate = new Date(lastPaymentDate);
      nextDueDate.setMonth(nextDueDate.getMonth() + 6);
    } else if (emi_type === 'yearly') {
      nextDueDate = new Date(lastPaymentDate);
      nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
    }
  }

  return {
    emi_number,
    total_emis,
    nextDueDate
  };
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

    const { key, order } = await createRazorpayOrder({
      amount: parsedAmount,
      currency,
      receipt
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
      key,
      order,
      payment
    });
  } catch (error) {
    const { statusCode, message, details } = formatPaymentError(
      error,
      'Could not create Razorpay order.'
    );

    return res.status(statusCode).json({
      message,
      ...(details ? { details } : {})
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
      emi_type,
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

      if (typeof emi_type !== 'undefined') {
        payment.emi_type = emi_type || null;
      }

      if (typeof emi_duedate !== 'undefined') {
        payment.emi_duedate = emi_duedate || null;
      }

      await payment.save();
    } else if (student_id && parsedAmount) {
      // Calculate EMI details for new payment
      const emiDetails = emi_type ? await calculateEMIDetails(student_id, emi_type) : { emi_number: 1, total_emis: 1, nextDueDate: null };

      payment = await Payment.create({
        txn_id: razorpay_payment_id,
        student_id,
        amount: parsedAmount,
        is_paid: true,
        emi_discount: emi_discount || 0,
        emi_type: emi_type || null,
        emi_number: emiDetails.emi_number,
        total_emis: emiDetails.total_emis,
        payment_date: payment_date || new Date(),
        emi_duedate: emiDetails.nextDueDate,
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
    const { statusCode, message, details } = formatPaymentError(
      error,
      'Could not verify payment.'
    );

    return res.status(statusCode).json({
      message,
      ...(details ? { details } : {})
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
      emi_type,
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

    // Calculate EMI details
    const emiDetails = emi_type ? await calculateEMIDetails(student_id, emi_type) : { emi_number: 1, total_emis: 1, nextDueDate: null };

    const payment = await Payment.create({
      txn_id: txn_id || razorpay_payment_id || null,
      student_id,
      amount: parsedAmount,
      is_paid: paidStatus,
      emi_discount,
      emi_type: emi_type || null,
      emi_number: emiDetails.emi_number,
      total_emis: emiDetails.total_emis,
      payment_date: payment_date || null,
      emi_duedate: emiDetails.nextDueDate,
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
    const { statusCode, message, details } = formatPaymentError(
      error,
      'Could not add payment.'
    );

    return res.status(statusCode).json({
      message,
      ...(details ? { details } : {})
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
    const { statusCode, message, details } = formatPaymentError(
      error,
      'Could not fetch payments.'
    );

    return res.status(statusCode).json({
      message,
      ...(details ? { details } : {})
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
    const { statusCode, message, details } = formatPaymentError(
      error,
      'Could not fetch payment.'
    );

    return res.status(statusCode).json({
      message,
      ...(details ? { details } : {})
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
    const { statusCode, message, details } = formatPaymentError(
      error,
      'Could not update payment.'
    );

    return res.status(statusCode).json({
      message,
      ...(details ? { details } : {})
    });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid payment id.' });
    }

    const deleted = await Payment.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Payment not found.' });
    }

    return res.status(200).json({
      message: 'Payment deleted successfully.',
      payment: deleted
    });
  } catch (error) {
    const { statusCode, message, details } = formatPaymentError(
      error,
      'Could not delete payment.'
    );

    return res.status(statusCode).json({
      message,
      ...(details ? { details } : {})
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
    const { statusCode, message, details } = formatPaymentError(
      error,
      'Could not search payments.'
    );

    return res.status(statusCode).json({
      message,
      ...(details ? { details } : {})
    });
  }
};

exports.generateReceipt = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid payment id.' });
    }

    const payment = await Payment.findById(id).populate('student_id');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found.' });
    }

    if (!payment.student_id) {
      return res.status(404).json({ message: 'Student details not found for this payment.' });
    }

    const pdfBuffer = await generateReceiptPDF(payment, payment.student_id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt_${payment._id}.pdf`);

    return res.send(pdfBuffer);
  } catch (error) {
    const { statusCode, message, details } = formatPaymentError(
      error,
      'Could not generate receipt.'
    );

    return res.status(statusCode).json({
      message,
      ...(details ? { details } : {})
    });
  }
};
