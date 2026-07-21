const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Statically serve the uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const courseRoutes = require('./routes/courseRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/courses', courseRoutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    try {
      const Student = require('./models/Student');
      
      // 1. Status normalization migration
      const students = await Student.find({
        status: { $in: ["Active", "Completed", "Dropped"] }
      });
      if (students.length > 0) {
        for (const student of students) {
          if (student.pendingAmount <= 0) {
            student.status = "Active - Payment Completed";
          } else {
            student.status = "Active - Payment Pending";
          }
          await student.save({ validateBeforeSave: false });
        }
      }

      // 2. Course to courses array migration
      const studentsToMigrate = await Student.find({
        $or: [
          { courses: { $exists: false } },
          { courses: { $size: 0 } }
        ]
      });
      if (studentsToMigrate.length > 0) {
        for (const student of studentsToMigrate) {
          const legacyCourse = student.get("course") || student._doc?.course;
          if (legacyCourse) {
            student.courses = [legacyCourse];
            await student.save({ validateBeforeSave: false });
          }
        }
      }
    } catch (migrateErr) {
      // Migration error caught
    }

    app.listen(PORT);
  })
  .catch((err) => {
    // Database connection error caught
  });
