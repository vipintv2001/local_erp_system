const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  courseId: { type: String, required: true, unique: true },
  courseName: { type: String, required: true },
  duration: { type: String, required: true }, // e.g. "6 Months"
  domain: { type: String, required: true }, // e.g. "Web Development"
  courseType: { type: String, required: true }, // e.g. "Part-time"
});

module.exports = mongoose.model("Course", courseSchema);
