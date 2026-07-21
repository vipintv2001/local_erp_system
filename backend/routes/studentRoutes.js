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

// Get Dashboard Metrics (Moved up so it doesn't conflict with /:id)
router.get("/metrics/dashboard", async (req, res) => {
  try {
    const activeAndPassoutQuery = {
      status: { $in: ["Active - Payment Completed", "Active - Payment Pending", "Active", "Passout"] }
    };

    const totalStudents = await Student.countDocuments(activeAndPassoutQuery);
    
    const activeStudents = await Student.countDocuments({
      status: { $in: ["Active - Payment Completed", "Active - Payment Pending", "Active"] }
    });

    const feesPending = await Student.countDocuments({
      ...activeAndPassoutQuery,
      pendingAmount: { $gt: 0 }
    });

    const fullyPaid = await Student.countDocuments({
      ...activeAndPassoutQuery,
      pendingAmount: { $lte: 0 }
    });

    const students = await Student.find();
    let totalExpected = 0;
    let totalPaid = 0;
    let totalPending = 0;

    students.forEach((s) => {
      totalExpected += s.totalFee;
      totalPaid += s.paidAmount || 0;
      totalPending += s.pendingAmount || 0;
    });

    const collectionRate =
      totalExpected > 0 ? ((totalPaid / totalExpected) * 100).toFixed(2) : 0;

    res.json({
      totalStudents,
      activeStudents,
      feesPending,
      fullyPaid,
      totalPending,
      collectionRate,
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
    res.json(students);
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
    console.log("=== 1. POST Request Received ===");
    console.log("Text Data (req.body):", req.body);
    console.log("File Data (req.file):", req.file);

    // Destructure all the new fields from req.body
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

    // Pass the newly destructured values to your model instance
    const newStudent = new Student({
      name,
      email,
      phone,
      dob, // Mongoose will automatically cast this string representation into a Date
      parentName,
      emergencyContact,
      address,
      highestQualification,
      courses: parseCourses(courses),
      courseDuration,
      totalFee: Number(totalFee), // Casting numeric values correctly
      imagePath,
    });

    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (err) {
    console.error("Error creating student:", err);
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
