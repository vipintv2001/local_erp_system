const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Student = require('../models/Student');

// Create Payment
router.post('/', async (req, res) => {
  try {
    const { student, amountPaid, method } = req.body;
    
    const studentDoc = await Student.findById(student);
    if (!studentDoc) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (studentDoc.pendingAmount <= 0) {
      return res.status(400).json({ message: "Student has already paid the entire fees" });
    }

    const payAmt = Number(amountPaid);
    if (payAmt > studentDoc.pendingAmount) {
      return res.status(400).json({ message: `Payment amount (₹${payAmt}) exceeds the pending fees of ₹${studentDoc.pendingAmount}` });
    }

    const newPayment = new Payment({
      student,
      amountPaid: payAmt,
      method
    });
    
    await newPayment.save();
    
    const populatedPayment = await Payment.findById(newPayment._id).populate('student', 'name course studentId');
    res.status(201).json(populatedPayment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all payments (History)
router.get('/', async (req, res) => {
  try {
    const payments = await Payment.find().populate('student', 'name course studentId').sort({ datePaid: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
