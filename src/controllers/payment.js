const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const Payment = require('../models/payment');

/* =========================================================
   HELPERS
========================================================= */

const isValidObjectId = (id) => mongoose.isValidObjectId(id);

const parseAmount = (amount) => {
  const value = Number(amount);

  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }

  return value;
};

const parseBoolean = (value) => {
  if (typeof value === 'boolean') return value;

  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }

  return Boolean(value);
};

const paymentPopulateOptions = {
  path: 'student_id',
  populate: [
    {
      path: 'course_Id',
      select: 'course_Name'
    },
    {
      path: 'batch_Id',
      select: 'batch_Name'
    }
  ]
};

/* =========================================================
   EMI CALCULATION
========================================================= */

const calculateEMIDetails = async (
  student_id,
  emi_type
) => {
  const payments = await Payment.find({
    student_id,
    is_paid: true
  }).sort({
    payment_date: 1
  });

  const emi_number = payments.length + 1;

  let total_emis = 1;

  if (emi_type === 'monthly') {
    total_emis = 12;
  }

  if (emi_type === 'quarterly') {
    total_emis = 4;
  }

  if (emi_type === 'semester') {
    total_emis = 2;
  }

  if (emi_type === 'yearly') {
    total_emis = 1;
  }

  let nextDueDate = null;

  if (emi_number < total_emis) {
    const lastPaymentDate =
      payments.length > 0
        ? new Date(
            payments[payments.length - 1].payment_date
          )
        : new Date();

    nextDueDate = new Date(lastPaymentDate);

    if (emi_type === 'monthly') {
      nextDueDate.setMonth(
        nextDueDate.getMonth() + 1
      );
    }

    if (emi_type === 'quarterly') {
      nextDueDate.setMonth(
        nextDueDate.getMonth() + 3
      );
    }

    if (emi_type === 'semester') {
      nextDueDate.setMonth(
        nextDueDate.getMonth() + 6
      );
    }

    if (emi_type === 'yearly') {
      nextDueDate.setFullYear(
        nextDueDate.getFullYear() + 1
      );
    }
  }

  return {
    emi_number,
    total_emis,
    nextDueDate
  };
};

/* =========================================================
   CREATE PAYMENT
========================================================= */

exports.addPayment = async (req, res) => {
  try {
    const {
      txn_id,
      student_id,
      is_paid,
      amount,
      emi_discount,
      emi_type,
      payment_date,
      currency,
      receipt,
      status
    } = req.body;

    if (!student_id || !isValidObjectId(student_id)) {
      return res.status(400).json({
        message: 'Valid student_id required'
      });
    }

    const parsedAmount = parseAmount(amount);

    if (!parsedAmount) {
      return res.status(400).json({
        message: 'Valid amount required'
      });
    }

    const emiDetails = emi_type
      ? await calculateEMIDetails(
          student_id,
          emi_type
        )
      : {
          emi_number: 1,
          total_emis: 1,
          nextDueDate: null
        };

    const payment = await Payment.create({
      txn_id: txn_id || null,

      student_id,

      is_paid: parseBoolean(is_paid),

      amount: parsedAmount,

      emi_discount: emi_discount || 0,

      emi_type: emi_type || null,

      emi_number: emiDetails.emi_number,

      total_emis: emiDetails.total_emis,

      payment_date: payment_date || new Date(),

      emi_duedate: emiDetails.nextDueDate,

      currency: currency || 'INR',

      receipt:
        receipt ||
        `RCPT-${Date.now()}`,

      status:
        status ||
        (parseBoolean(is_paid)
          ? 'paid'
          : 'pending')
    });

    res.status(201).json({
      message: 'Payment added successfully',
      payment
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

/* =========================================================
   GET ALL PAYMENTS
========================================================= */

exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate(paymentPopulateOptions)
      .sort({
        created_at: -1
      });

    res.status(200).json({
      count: payments.length,
      payments
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

/* =========================================================
   GET PAYMENT BY ID
========================================================= */

exports.getPaymentById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: 'Invalid payment id'
      });
    }

    const payment = await Payment.findById(
      id
    ).populate(paymentPopulateOptions);

    if (!payment) {
      return res.status(404).json({
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      payment
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

/* =========================================================
   UPDATE PAYMENT
========================================================= */

exports.updatePayment = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: 'Invalid payment id'
      });
    }

    if (req.body.amount) {
      const parsedAmount = parseAmount(
        req.body.amount
      );

      if (!parsedAmount) {
        return res.status(400).json({
          message: 'Invalid amount'
        });
      }

      req.body.amount = parsedAmount;
    }

    if (
      typeof req.body.is_paid !==
      'undefined'
    ) {
      req.body.is_paid = parseBoolean(
        req.body.is_paid
      );
    }

    const payment =
      await Payment.findByIdAndUpdate(
        id,
        req.body,
        {
          new: true,
          runValidators: true
        }
      ).populate(paymentPopulateOptions);

    if (!payment) {
      return res.status(404).json({
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      message: 'Payment updated successfully',
      payment
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

/* =========================================================
   DELETE PAYMENT
========================================================= */

exports.deletePayment = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: 'Invalid payment id'
      });
    }

    const payment =
      await Payment.findByIdAndDelete(id);

    if (!payment) {
      return res.status(404).json({
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      message: 'Payment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

/* =========================================================
   SEARCH PAYMENT
========================================================= */

exports.searchPayment = async (
  req,
  res
) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        message: 'Search query required'
      });
    }

    const filters = [
      {
        txn_id: {
          $regex: query,
          $options: 'i'
        }
      },
      {
        receipt: {
          $regex: query,
          $options: 'i'
        }
      },
      {
        status: {
          $regex: query,
          $options: 'i'
        }
      }
    ];

    if (isValidObjectId(query)) {
      filters.push({
        student_id: query
      });
    }

    const payments = await Payment.find({
      $or: filters
    })
      .populate(paymentPopulateOptions)
      .sort({
        created_at: -1
      });

    res.status(200).json({
      count: payments.length,
      payments
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

/* =========================================================
   DOWNLOAD RECEIPT PDF
========================================================= */

exports.generateReceipt = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: 'Invalid payment id'
      });
    }

    const payment = await Payment.findById(
      id
    ).populate(paymentPopulateOptions);

    if (!payment) {
      return res.status(404).json({
        message: 'Payment not found'
      });
    }

    const student = payment.student_id;

    const doc = new PDFDocument({
      margin: 50
    });

    res.setHeader(
      'Content-Type',
      'application/pdf'
    );

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=receipt-${payment.receipt}.pdf`
    );

    doc.pipe(res);

    /* =====================================
       HEADER
    ===================================== */

    doc
      .fontSize(24)
      .text('PAYMENT RECEIPT', {
        align: 'center'
      });

    doc.moveDown(2);

    /* =====================================
       STUDENT DETAILS
    ===================================== */

    doc
      .fontSize(16)
      .text('Student Details', {
        underline: true
      });

    doc.moveDown();

    doc.fontSize(12);

    doc.text(
      `Name: ${student?.name || 'N/A'}`
    );

    doc.text(
      `Enrollment ID: ${
        student?.enrollment_Id || 'N/A'
      }`
    );

    doc.text(
      `Email: ${student?.email || 'N/A'}`
    );

    doc.text(
      `Contact: ${student?.contact || 'N/A'}`
    );

    doc.text(
      `Course: ${
        student?.course_Id?.course_Name ||
        'N/A'
      }`
    );

    doc.text(
      `Batch: ${
        student?.batch_Id?.batch_Name ||
        'N/A'
      }`
    );

    doc.moveDown(2);

    /* =====================================
       PAYMENT DETAILS
    ===================================== */

    doc
      .fontSize(16)
      .text('Payment Details', {
        underline: true
      });

    doc.moveDown();

    doc.fontSize(12);

    doc.text(
      `Receipt No: ${payment.receipt}`
    );

    doc.text(
      `Transaction ID: ${
        payment.txn_id || 'N/A'
      }`
    );

    doc.text(
      `Amount: ₹${payment.amount}`
    );

    doc.text(
      `Discount: ₹${payment.emi_discount}`
    );

    doc.text(
      `Net Amount: ₹${
        payment.amount -
        payment.emi_discount
      }`
    );

    doc.text(
      `Currency: ${payment.currency}`
    );

    doc.text(
      `Status: ${payment.status}`
    );

    doc.text(
      `Payment Date: ${
        payment.payment_date
          ? new Date(
              payment.payment_date
            ).toLocaleDateString()
          : 'N/A'
      }`
    );

    doc.text(
      `EMI Type: ${
        payment.emi_type || 'N/A'
      }`
    );

    doc.text(
      `EMI Number: ${payment.emi_number}/${payment.total_emis}`
    );

    if (payment.emi_duedate) {
      doc.text(
        `Next EMI Due Date: ${new Date(
          payment.emi_duedate
        ).toLocaleDateString()}`
      );
    }

    doc.moveDown(3);

    /* =====================================
       FOOTER
    ===================================== */

    doc
      .fontSize(14)
      .text(
        'Thank you for your payment!',
        {
          align: 'center'
        }
      );

    doc.end();
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};