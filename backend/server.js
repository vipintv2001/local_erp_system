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
    console.log('Connected to local MongoDB');
    
    // Run status normalization migration for legacy students
    try {
      const Student = require('./models/Student');
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
        console.log(`Successfully migrated ${students.length} legacy student statuses.`);
      }
    } catch (migrateErr) {
      console.error("Migration error:", migrateErr);
    }

    app.listen(PORT, () => {
      console.log(`Server running on http://127.0.0.1:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });
