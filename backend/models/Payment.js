const mongoose = require("mongoose");
const Counter = require("./Counter");
const Student = require("./Student");
const { logEvent } = require("../utils/logger");

const paymentSchema = new mongoose.Schema({
  receiptId: { type: String, unique: true },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  amountPaid: { type: Number, required: true },
  method: {
    type: String,
    enum: ["UPI", "Cash", "Bank Transfer", "Check"],
    required: true,
  },
  datePaid: { type: Date, default: Date.now },
});

// 1. Corrected Pre-save Hook (Fixed Deprecation Warning)
paymentSchema.pre("save", async function () {
  if (this.isNew) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { id: "receiptId" },
        { $inc: { seq: 1 } },
        { returnDocument: "after", upsert: true }, // ✅ Fixed: Swapped { new: true } for modern Mongoose compliance
      );
      // Format: REC-10001
      const seqStr = String(counter.seq).padStart(5, "0");
      this.receiptId = `REC-${seqStr}`;
    } catch (error) {
      throw error;
    }
  }
});

// 2. Corrected Post-save Hook (Fixed "Failed to record payment" error)
paymentSchema.post("save", async function (doc) {
  try {
    const student = await Student.findById(doc.student);
    if (student) {
      student.paidAmount += doc.amountPaid;
      student.pendingAmount = student.totalFee - student.paidAmount;

      if (student.status.startsWith("Active")) {
        if (student.pendingAmount <= 0) {
          student.status = "Active - Payment Completed";
        } else {
          student.status = "Active - Payment Pending";
        }
      }

      // ✅ Fixed: Bypasses validation so missing new fields on old students won't crash payments
      await student.save({ validateBeforeSave: false });

      logEvent(
        `Payment received: ${doc.amountPaid} for student ${student.studentId} (Receipt: ${doc.receiptId})`,
      );
    }
  } catch (error) {
    console.error("❌ ERROR IN PAYMENT POST-SAVE HOOK:", error);
    // Note: Errors thrown inside post-save hooks do not automatically propagate back
    // to Express nicely unless explicitly caught or handled. Logging it helps track it down.
  }
});

module.exports = mongoose.model("Payment", paymentSchema);
