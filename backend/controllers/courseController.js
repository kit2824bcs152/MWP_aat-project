const Course = require('../models/Course');
const Faculty = require('../models/Faculty');
const Enrollment = require('../models/Enrollment');

// @desc    Get all courses with search, filter, and pagination
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res, next) => {
  try {
    const { search, department, page = 1, limit = 10 } = req.query;
    const query = {};

    if (department && department !== 'All') {
      query.department = department;
    }

    if (search) {
      query.$or = [
        { courseName: { $regex: search, $options: 'i' } },
        { courseCode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .populate('faculty', 'name employeeId email department specialization')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: courses.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      data: courses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single course by ID with faculty and enrolled students count
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('faculty', 'name employeeId email department specialization');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: `Course with ID ${req.params.id} not found`
      });
    }

    const enrollments = await Enrollment.find({ course: req.params.id })
      .populate('student', 'name rollNumber email department year');

    res.status(200).json({
      success: true,
      data: course,
      enrolledCount: enrollments.length,
      enrollments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Public
const createCourse = async (req, res, next) => {
  try {
    const { courseName, courseCode, department, credits, faculty, description } = req.body;

    // Check duplicate courseCode
    const existingCourse = await Course.findOne({ courseCode: courseCode?.trim()?.toUpperCase() });
    if (existingCourse) {
      return res.status(409).json({
        success: false,
        message: `Course with code '${courseCode}' already exists.`
      });
    }

    // Verify faculty exists if provided
    let facultyId = null;
    if (faculty && faculty !== '') {
      const facultyExists = await Faculty.findById(faculty);
      if (!facultyExists) {
        return res.status(400).json({
          success: false,
          message: 'Selected faculty member does not exist.'
        });
      }
      facultyId = faculty;
    }

    const course = await Course.create({
      courseName,
      courseCode: courseCode?.trim()?.toUpperCase(),
      department,
      credits: Number(credits),
      faculty: facultyId,
      description: description || ''
    });

    const populatedCourse = await Course.findById(course._id)
      .populate('faculty', 'name employeeId email department specialization');

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: populatedCourse
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Public
const updateCourse = async (req, res, next) => {
  try {
    const { courseName, courseCode, department, credits, faculty, description } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: `Course with ID ${req.params.id} not found`
      });
    }

    // Check duplicate courseCode if changed
    if (courseCode && courseCode.trim().toUpperCase() !== course.courseCode) {
      const duplicateCode = await Course.findOne({
        courseCode: courseCode.trim().toUpperCase(),
        _id: { $ne: req.params.id }
      });
      if (duplicateCode) {
        return res.status(409).json({
          success: false,
          message: `Course code '${courseCode}' is already used by another course.`
        });
      }
    }

    // Verify faculty exists if provided
    let facultyId = course.faculty;
    if (faculty !== undefined) {
      if (faculty && faculty !== '') {
        const facultyExists = await Faculty.findById(faculty);
        if (!facultyExists) {
          return res.status(400).json({
            success: false,
            message: 'Selected faculty member does not exist.'
          });
        }
        facultyId = faculty;
      } else {
        facultyId = null;
      }
    }

    course.courseName = courseName ?? course.courseName;
    course.courseCode = courseCode ? courseCode.trim().toUpperCase() : course.courseCode;
    course.department = department ?? course.department;
    course.credits = credits !== undefined ? Number(credits) : course.credits;
    course.faculty = facultyId;
    course.description = description !== undefined ? description : course.description;

    await course.save();

    const updatedCourse = await Course.findById(course._id)
      .populate('faculty', 'name employeeId email department specialization');

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: updatedCourse
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete course and related enrollments
// @route   DELETE /api/courses/:id
// @access  Public
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: `Course with ID ${req.params.id} not found`
      });
    }

    // Delete enrollments for this course
    await Enrollment.deleteMany({ course: req.params.id });

    await course.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Course and related enrollment records deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse
};
