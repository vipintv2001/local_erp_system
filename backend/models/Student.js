const mongoose = require("mongoose");
const Counter = require("./Counter");
const { logEvent } = require("../utils/logger");

const studentSchema = new mongoose.Schema({
  studentId: { type: String, unique: true },
  imagePath: { type: String, default: "uploads/default.png" },
  name: { type: String, required: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true },
  dob: { type: Date, required: true },
  parentName: { type: String, required: true },
  emergencyContact: { type: String, required: true },
  address: { type: String, required: true },
  highestQualification: { type: String, required: true },
  courses: [{ type: String, required: true }],
  courseDuration: { type: String, required: true }, // e.g., "6 Months", "1 Year"
  totalFee: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  pendingAmount: { type: Number },
  admissionDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: [
      "Active - Payment Completed",
      "Active - Payment Pending",
      "Passout",
      "Active",
      "Dropped",
      "Completed",
    ],
    default: "Active - Payment Pending",
  },
});

// Remove 'next' from the argument list here 👇
studentSchema.pre("save", async function () {
  if (
    this.isModified("totalFee") ||
    this.isModified("paidAmount") ||
    this.isNew
  ) {
    this.pendingAmount = this.totalFee - this.paidAmount;
  }

  // Refine student status if it is "Active", starts with "Active", or is a new record
  if (
    this.isNew ||
    this.isModified("status") ||
    this.isModified("totalFee") ||
    this.isModified("paidAmount")
  ) {
    if (
      this.status === "Active" ||
      this.status.startsWith("Active") ||
      this.isNew
    ) {
      if (this.pendingAmount <= 0) {
        this.status = "Active - Payment Completed";
      } else {
        this.status = "Active - Payment Pending";
      }
    }
  }

  if (this.isNew) {
    try {
      // Find the counter document and increment sequence by 1
      let counter = await Counter.findOneAndUpdate(
        { id: "studentId" },
        { $inc: { seq: 1 } },
        { returnDocument: "after", upsert: true } // Creates it if missing
      );

      // Format the sequence number to 4 digits (e.g., 0001)
      const year = new Date().getFullYear();
      const seqStr = String(counter.seq).padStart(4, "0");
      this.studentId = `TEC-${year}-${seqStr}`;

      logEvent(`New student registered: ${this.name} (${this.studentId})`);
    } catch (error) {
      console.error("❌ CRITICAL COUNTER ERROR:", error);
      throw error; // 👈 Simply throw the error; Mongoose handles it gracefully
    }
  } else if (this.isModified("status")) {
    logEvent(`Student status changed: ${this.studentId} is now ${this.status}`);
  }
  
  // No next() call needed here at all! 🎉
});

module.exports = mongoose.model("Student", studentSchema);
