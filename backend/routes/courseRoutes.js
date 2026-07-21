const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// Get all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find().sort({ courseId: 1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create Course
router.post('/', async (req, res) => {
  const { courseId, courseName, duration, domain, courseType } = req.body;
  try {
    const existing = await Course.findOne({ courseId });
    if (existing) {
      return res.status(400).json({ message: `Course ID '${courseId}' already exists.` });
    }

    const newCourse = new Course({
      courseId,
      courseName,
      duration,
      domain,
      courseType
    });

    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Course
router.put('/:id', async (req, res) => {
  try {
    const { courseId, courseName, duration, domain, courseType } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (courseId && courseId !== course.courseId) {
      const existing = await Course.findOne({ courseId });
      if (existing) {
        return res.status(400).json({ message: `Course ID '${courseId}' already exists.` });
      }
    }

    course.courseId = courseId || course.courseId;
    course.courseName = courseName || course.courseName;
    course.duration = duration || course.duration;
    course.domain = domain || course.domain;
    course.courseType = courseType || course.courseType;

    await course.save();
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete Course
router.delete('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

