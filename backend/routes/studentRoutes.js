const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Payment = require("../models/Payment");
const upload = require("../middlewares/upload");

const parseCourses = (courses) => {
  if (!courses) return [];
  if (Array.isArray(courses)) return courses;
  if (typeof courses === "string") {
    const trimmed = courses.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        return JSON.parse(trimmed);
      } catch (e) {
        // Fallback to split
      }
    }
    return trimmed.split(",").map(c => c.trim()).filter(Boolean);
  }
  return [];
};

// ==========================================
// 1. STATIC & SPECIFIC GET ROUTES FIRST
// ==========================================

// Get Dashboard Metrics
router.get("/metrics/dashboard", async (req, res) => {
  try {
    const students = await Student.find();
    const payments = await Payment.find().sort({ datePaid: -1 });

    const studentPaymentsMap = {};
    let allTimeFeesCollected = 0;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let feesCollectedThisMonth = 0;

    payments.forEach((p) => {
      const amt = Number(p.amountPaid) || 0;
      allTimeFeesCollected += amt;

      const sId = p.student ? p.student.toString() : null;
      if (sId) {
        studentPaymentsMap[sId] = (studentPaymentsMap[sId] || 0) + amt;
      }

      if (p.datePaid) {
        const d = new Date(p.datePaid);
        if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
          feesCollectedThisMonth += amt;
        }
      }
    });

    let totalStudents = students.length;
    let activeStudents = 0;
    let feesPendingCount = 0;
    let totalExpected = 0;
    let totalPaid = 0;
    let totalPending = 0;

    for (const s of students) {
      const sId = s._id.toString();
      const paidFromPayments = studentPaymentsMap[sId] || 0;
      const paidFromDoc = Number(s.paidAmount) || 0;
      const actualPaid = Math.max(paidFromPayments, paidFromDoc);
      const totalFee = Number(s.totalFee) || 0;
      const pending = Math.max(0, totalFee - actualPaid);

      totalExpected += totalFee;
      totalPaid += actualPaid;
      totalPending += pending;

      if (pending > 0) {
        feesPendingCount++;
      }

      const isActive = s.status && (s.status === "Active" || s.status.startsWith("Active"));
      if (isActive) {
        activeStudents++;
      }

      if (s.paidAmount !== actualPaid || s.pendingAmount !== pending) {
        s.paidAmount = actualPaid;
        s.pendingAmount = pending;
        if (isActive) {
          s.status = pending <= 0 ? "Active - Payment Completed" : "Active - Payment Pending";
        }
        await s.save({ validateBeforeSave: false });
      }
    }

    const collectionRate = totalExpected > 0 ? ((totalPaid / totalExpected) * 100).toFixed(2) : 0;

    res.json({
      totalStudents,
      activeStudents,
      feesPendingCount,
      totalPending,
      feesCollectedThisMonth,
      allTimeFeesCollected,
      collectionRate: Number(collectionRate),
      payments,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Fuzzy Search (Must be above /:id)
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }

    const regex = new RegExp(q, "i");
    const students = await Student.find({
      $or: [{ name: regex }, { studentId: regex }, { courses: regex }],
    }).limit(10);

    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find().sort({ admissionDate: -1 });
    const payments = await Payment.find();
    const paymentsMap = {};
    payments.forEach((p) => {
      const sId = p.student ? p.student.toString() : null;
      if (sId) {
        paymentsMap[sId] = (paymentsMap[sId] || 0) + (Number(p.amountPaid) || 0);
      }
    });

    const sanitized = students.map((s) => {
      const doc = s.toObject();
      const paidFromPayments = paymentsMap[s._id.toString()] || 0;
      const paidFromDoc = Number(s.paidAmount) || 0;
      doc.paidAmount = Math.max(paidFromPayments, paidFromDoc);
      doc.pendingAmount = Math.max(0, (Number(s.totalFee) || 0) - doc.paidAmount);
      return doc;
    });

    res.json(sanitized);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 2. POST / WRITE ROUTES
// ==========================================

// Create Student
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      dob,
      parentName,
      emergencyContact,
      address,
      highestQualification,
      courses,
      courseDuration,
      totalFee,
    } = req.body;

    let imagePath = "uploads/default.png";
    if (req.file) {
      imagePath = "uploads/" + req.file.filename;
    }

    const newStudent = new Student({
      name,
      email,
      phone,
      dob,
      parentName,
      emergencyContact,
      address,
      highestQualification,
      courses: parseCourses(courses),
      courseDuration,
      totalFee: Number(totalFee),
      imagePath,
    });

    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 3. DYNAMIC PARAMETER ROUTES LAST (/:id)
// ==========================================

// Get Single Student and their payments
router.get("/:id", async (req, res) => {
  try {
    // Basic structural guard to make sure it's a valid MongoDB ID before querying
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res
        .status(400)
        .json({ message: "Invalid Student Document ID format" });
    }

    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const payments = await Payment.find({ student: student._id }).sort({
      datePaid: -1,
    });

    res.json({ student, payments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Student
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.imagePath = "uploads/" + req.file.filename;
    }
    if (updateData.totalFee) {
      updateData.totalFee = Number(updateData.totalFee);
    }
    if (updateData.courses !== undefined) {
      updateData.courses = parseCourses(updateData.courses);
    }

    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (updateData.totalFee !== undefined) {
      const newTotalFee = Number(updateData.totalFee);
      if (newTotalFee < student.paidAmount) {
        return res.status(400).json({ message: `Total Fee cannot be less than the already paid amount of ₹${student.paidAmount}` });
      }
    }

    // Explicitly delete courses if it is set in updateData, to let Object.assign assign the parsed array
    Object.assign(student, updateData);

    if (updateData.totalFee !== undefined) {
      student.pendingAmount = student.totalFee - student.paidAmount;
    }

    await student.save();
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete Student
router.delete("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    await Payment.deleteMany({ student: student._id });
    await Student.findByIdAndDelete(req.params.id);

    res.json({ message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
