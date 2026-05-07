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

const paymentPopulateOptions = {
  path: 'student_id',
  populate: [
    { path: 'course_Id', select: 'course_Name' },
    { path: 'batch_Id', select: 'batch_Name' }
  ]
};

const formatReceiptCurrency = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return 'INR 0';
  }

  return `INR ${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

const formatReceiptDate = (value, includeTime = false) => {
  if (!value) {
    return 'N/A';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'N/A';
  }

  return date.toLocaleString(
    'en-IN',
    includeTime
      ? {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }
      : {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }
  );
};

const toTitleCase = (value) =>
  String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getReceiptStatusLabel = (payment) => {
  if (payment?.is_paid) {
    return 'Paid';
  }

  return toTitleCase(payment?.status || 'pending');
};

const getReceiptPlanLabel = (payment) => {
  if (payment?.is_full_payment) {
    return 'Full Payment';
  }

  return payment?.emi_type ? toTitleCase(payment.emi_type) : 'N/A';
};

const getStudentCourseLabel = (student) => {
  const course = student?.course_Id;

  if (course && typeof course === 'object') {
    return course.course_Name || 'N/A';
  }

  return course || 'N/A';
};

const getStudentBatchLabel = (student) => {
  const batch = student?.batch_Id;

  if (batch && typeof batch === 'object') {
    return batch.batch_Name || 'N/A';
  }

  return batch || 'N/A';
};

const getStudentAddressLabel = (student) => {
  const address = student?.address;

  if (!address || typeof address !== 'object') {
    return 'N/A';
  }

  const parts = [address.street, address.city, address.state, address.pincode].filter(Boolean);
  return parts.length ? parts.join(', ') : 'N/A';
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

const buildOfficialReceiptPDF = (payment, student) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: {
          Title: `Payment Receipt ${payment.receipt || payment._id}`,
          Author: 'TIPS GALWAR',
          Subject: 'Official payment receipt'
        }
      });
      const buffers = [];
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const left = doc.page.margins.left;
      const top = doc.page.margins.top;
      const right = pageWidth - doc.page.margins.right;
      const contentWidth = pageWidth - doc.page.margins.left - doc.page.margins.right;
      const footerY = pageHeight - doc.page.margins.bottom - 34;
      const primaryColor = '#1D4ED8';
      const primarySoft = '#EAF2FF';
      const borderColor = '#D7E3F4';
      const inkColor = '#0F172A';
      const mutedColor = '#64748B';
      const statusColor = payment?.is_paid ? '#15803D' : '#B45309';
      const netAmount = Math.max((Number(payment.amount) || 0) - (Number(payment.emi_discount) || 0), 0);
      const paidOn = formatReceiptDate(payment.payment_date || payment.created_at);
      const generatedOn = formatReceiptDate(new Date(), true);
      const studentName = student?.name || 'N/A';
      const receiptNumber = payment.receipt || payment._id?.toString() || 'N/A';
      const transactionId = payment.txn_id || payment.razorpay_payment_id || 'N/A';
      const sectionGap = 18;
      const rowGap = 10;

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      const ensureSpace = (heightNeeded) => {
        if (doc.y + heightNeeded <= footerY - 20) {
          return;
        }

        doc.addPage();
      };

      const drawInfoCard = (x, y, width, title, rows) => {
        const padding = 16;
        const labelWidth = 86;
        const valueWidth = width - padding * 2 - labelWidth;
        const bodyStartY = y + 40;
        let currentY = bodyStartY;

        rows.forEach(([label, value]) => {
          const valueText = String(value || 'N/A');
          const labelHeight = doc.heightOfString(label, { width: labelWidth, lineGap: 1 });
          const valueHeight = doc.heightOfString(valueText, { width: valueWidth, lineGap: 1 });
          currentY += Math.max(labelHeight, valueHeight) + rowGap;
        });

        const height = currentY - y + padding;

        doc
          .roundedRect(x, y, width, height, 12)
          .lineWidth(1)
          .strokeColor(borderColor)
          .fillAndStroke('#FFFFFF', borderColor);

        doc
          .fillColor(primaryColor)
          .font('Helvetica-Bold')
          .fontSize(11)
          .text(title, x + padding, y + 16, { width: width - padding * 2 });

        currentY = bodyStartY;
        rows.forEach(([label, value]) => {
          const valueText = String(value || 'N/A');
          const labelHeight = doc.heightOfString(label, { width: labelWidth, lineGap: 1 });
          const valueHeight = doc.heightOfString(valueText, { width: valueWidth, lineGap: 1 });
          const rowHeight = Math.max(labelHeight, valueHeight);

          doc
            .fillColor(mutedColor)
            .font('Helvetica-Bold')
            .fontSize(9.5)
            .text(label, x + padding, currentY, {
              width: labelWidth,
              lineGap: 1
            });

          doc
            .fillColor(inkColor)
            .font('Helvetica')
            .fontSize(10)
            .text(valueText, x + padding + labelWidth, currentY, {
              width: valueWidth,
              lineGap: 1
            });

          currentY += rowHeight + rowGap;
        });

        return height;
      };

      const drawTableSection = (title, rows) => {
        const sectionTop = doc.y;
        const sectionPadding = 16;
        const labelWidth = 150;
        const valueWidth = contentWidth - sectionPadding * 2 - labelWidth;
        let totalHeight = 54;

        rows.forEach(([label, value]) => {
          const valueText = String(value || 'N/A');
          const labelHeight = doc.heightOfString(label, { width: labelWidth - 16, lineGap: 1 });
          const valueHeight = doc.heightOfString(valueText, { width: valueWidth - 12, lineGap: 1 });
          totalHeight += Math.max(labelHeight, valueHeight) + 20;
        });

        ensureSpace(totalHeight + 24);

        doc
          .roundedRect(left, doc.y, contentWidth, totalHeight, 12)
          .lineWidth(1)
          .strokeColor(borderColor)
          .fillAndStroke('#FFFFFF', borderColor);

        doc
          .fillColor(primaryColor)
          .font('Helvetica-Bold')
          .fontSize(12)
          .text(title, left + sectionPadding, doc.y + 16, {
            width: contentWidth - sectionPadding * 2
          });

        let currentY = doc.y + 44;
        rows.forEach(([label, value], index) => {
          const valueText = String(value || 'N/A');
          const rowHeight = Math.max(
            doc.heightOfString(label, { width: labelWidth - 16, lineGap: 1 }),
            doc.heightOfString(valueText, { width: valueWidth - 12, lineGap: 1 })
          ) + 14;

          if (index % 2 === 0) {
            doc
              .rect(left + 8, currentY - 6, contentWidth - 16, rowHeight + 6)
              .fill(primarySoft);
          }

          doc
            .fillColor(mutedColor)
            .font('Helvetica-Bold')
            .fontSize(9.5)
            .text(label, left + sectionPadding, currentY, {
              width: labelWidth - 16,
              lineGap: 1
            });

          doc
            .fillColor(inkColor)
            .font('Helvetica')
            .fontSize(10)
            .text(valueText, left + sectionPadding + labelWidth, currentY, {
              width: valueWidth - 12,
              lineGap: 1
            });

          currentY += rowHeight + 6;
        });

        doc.y = sectionTop + totalHeight + sectionGap;
      };

      doc.rect(0, 0, pageWidth, 128).fill(primaryColor);

      doc
        .fillColor('#FFFFFF')
        .font('Helvetica-Bold')
        .fontSize(24)
        .text('TIPS GALWAR', left, top + 6);

      doc
        .font('Helvetica')
        .fontSize(11)
        .text('Institute of Technical & Professional Studies', left, top + 38);

      doc
        .fontSize(10)
        .fillColor('#DBEAFE')
        .text('Official Student Fee Receipt', left, top + 58);

      doc
        .fontSize(9)
        .text('Generated by Accounts & Collections Desk', left, top + 76);

      doc
        .roundedRect(right - 192, top + 2, 192, 86, 14)
        .fillAndStroke('#FFFFFF', '#FFFFFF');

      doc
        .fillColor(primaryColor)
        .font('Helvetica-Bold')
        .fontSize(10)
        .text('OFFICIAL RECEIPT', right - 176, top + 16, {
          width: 160,
          align: 'center'
        });

      doc
        .fillColor(mutedColor)
        .font('Helvetica')
        .fontSize(9)
        .text(`Receipt No. ${receiptNumber}`, right - 176, top + 38, {
          width: 160,
          align: 'center'
        });

      doc
        .text(`Issued on ${paidOn}`, right - 176, top + 54, {
          width: 160,
          align: 'center'
        });

      doc
        .fillColor(statusColor)
        .font('Helvetica-Bold')
        .fontSize(11)
        .text(getReceiptStatusLabel(payment), right - 176, top + 70, {
          width: 160,
          align: 'center'
        });

      doc.y = 146;

      ensureSpace(96);
      doc
        .roundedRect(left, doc.y, contentWidth, 78, 14)
        .lineWidth(1)
        .strokeColor(borderColor)
        .fillAndStroke('#FFFFFF', borderColor);

      doc
        .fillColor(mutedColor)
        .font('Helvetica-Bold')
        .fontSize(10)
        .text('Received With Thanks From', left + 20, doc.y + 18);

      doc
        .fillColor(inkColor)
        .font('Helvetica-Bold')
        .fontSize(18)
        .text(studentName, left + 20, doc.y + 34, {
          width: contentWidth - 220
        });

      doc
        .fillColor(primaryColor)
        .font('Helvetica')
        .fontSize(10)
        .text('Net Amount Received', right - 150, doc.y + 18, {
          width: 120,
          align: 'right'
        });

      doc
        .font('Helvetica-Bold')
        .fontSize(22)
        .text(formatReceiptCurrency(netAmount), right - 160, doc.y + 36, {
          width: 130,
          align: 'right'
        });

      doc.y += 94;

      const cardGap = 16;
      const cardWidth = (contentWidth - cardGap) / 2;
      const studentRows = [
        ['Enrollment ID', student?.enrollment_Id || 'N/A'],
        ['Course', getStudentCourseLabel(student)],
        ['Batch', getStudentBatchLabel(student)],
        ['Contact', student?.contact || 'N/A'],
        ['Email', student?.email || 'N/A'],
        ['Address', getStudentAddressLabel(student)]
      ];
      const paymentRows = [
        ['Receipt No', receiptNumber],
        ['Payment Date', paidOn],
        ['Payment Plan', getReceiptPlanLabel(payment)],
        ['Installment', payment?.is_full_payment ? 'Single payment' : `${payment.emi_number || 1} of ${payment.total_emis || 1}`],
        ['Transaction ID', transactionId],
        ['Status', getReceiptStatusLabel(payment)]
      ];

      ensureSpace(260);
      const cardsStartY = doc.y;
      const studentCardHeight = drawInfoCard(left, cardsStartY, cardWidth, 'Student Details', studentRows);
      const paymentCardHeight = drawInfoCard(left + cardWidth + cardGap, cardsStartY, cardWidth, 'Receipt Details', paymentRows);
      doc.y = cardsStartY + Math.max(studentCardHeight, paymentCardHeight) + sectionGap;

      const amountRows = [
        ['Gross Amount', formatReceiptCurrency(payment.amount)],
        ['Discount Applied', formatReceiptCurrency(payment.emi_discount || 0)],
        ['Net Amount Received', formatReceiptCurrency(netAmount)],
        ['Recorded On', paidOn],
        ['Generated On', generatedOn]
      ];

      if (!payment?.is_full_payment) {
        amountRows.splice(3, 0, ['EMI Plan', `${getReceiptPlanLabel(payment)} (${payment.emi_number || 1}/${payment.total_emis || 1})`]);
      }

      drawTableSection('Amount Breakdown', amountRows);

      if (!payment?.is_full_payment && payment?.emi_duedate) {
        drawTableSection('Upcoming EMI Reminder', [
          ['Next Due Date', formatReceiptDate(payment.emi_duedate)],
          ['Next Installment', `${Math.min((payment.emi_number || 1) + 1, payment.total_emis || 1)} of ${payment.total_emis || 1}`],
          ['Expected Amount', formatReceiptCurrency(payment.amount)]
        ]);
      }

      ensureSpace(92);
      doc
        .roundedRect(left, doc.y, contentWidth, 78, 12)
        .lineWidth(1)
        .strokeColor(borderColor)
        .fillAndStroke(primarySoft, borderColor);

      doc
        .fillColor(inkColor)
        .font('Helvetica-Bold')
        .fontSize(10)
        .text('Notes', left + 16, doc.y + 14);

      doc
        .font('Helvetica')
        .fontSize(9.5)
        .fillColor(mutedColor)
        .text(
          'This is a computer-generated official receipt issued against the payment recorded in the system. Please keep it for future fee and audit reference.',
          left + 16,
          doc.y + 30,
          {
            width: contentWidth - 32,
            lineGap: 2
          }
        );

      doc
        .moveTo(right - 160, doc.y + 58)
        .lineTo(right - 20, doc.y + 58)
        .lineWidth(1)
        .strokeColor('#94A3B8')
        .stroke();

      doc
        .fillColor(mutedColor)
        .font('Helvetica-Bold')
        .fontSize(9)
        .text('Authorized Signatory', right - 150, doc.y + 62, {
          width: 120,
          align: 'center'
        });

      doc
        .moveTo(left, footerY)
        .lineTo(right, footerY)
        .lineWidth(1)
        .strokeColor(borderColor)
        .stroke();

      doc
        .fillColor(mutedColor)
        .font('Helvetica')
        .fontSize(8.5)
        .text('TIPS GALWAR | Accounts Department Copy', left, footerY + 10);

      doc
        .text(generatedOn, right - 120, footerY + 10, {
          width: 120,
          align: 'right'
        });

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
      .populate(paymentPopulateOptions)
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

    const payment = await Payment.findById(id).populate(paymentPopulateOptions);

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
    }).populate(paymentPopulateOptions);

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
      .populate(paymentPopulateOptions)
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

    const payment = await Payment.findById(id).populate(paymentPopulateOptions);

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found.' });
    }

    if (!payment.student_id) {
      return res.status(404).json({ message: 'Student details not found for this payment.' });
    }

    const pdfBuffer = await buildOfficialReceiptPDF(payment, payment.student_id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${sanitizeReceipt(`receipt_${payment.receipt || payment.student_id?.enrollment_Id || payment._id}`)}.pdf`
    );

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
