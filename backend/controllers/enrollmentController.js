const Enrollment = require('../models/Enrollment');
const Student = require('../models/Student');
const Course = require('../models/Course');

// @desc    Get all enrollments with search, filter, and pagination
// @route   GET /api/enrollments
// @access  Public
const getEnrollments = async (req, res, next) => {
  try {
    const { search, status, courseId, studentId, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (courseId) {
      query.course = courseId;
    }

    if (studentId) {
      query.student = studentId;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // If search is provided, we first find matching student and course IDs
    if (search) {
      const [matchingStudents, matchingCourses] = await Promise.all([
        Student.find({
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { rollNumber: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        }).select('_id'),
        Course.find({
          $or: [
            { courseName: { $regex: search, $options: 'i' } },
            { courseCode: { $regex: search, $options: 'i' } }
          ]
        }).select('_id')
      ]);

      const studentIds = matchingStudents.map((s) => s._id);
      const courseIds = matchingCourses.map((c) => c._id);

      query.$or = [
        { student: { $in: studentIds } },
        { course: { $in: courseIds } }
      ];
    }

    const total = await Enrollment.countDocuments(query);
    const enrollments = await Enrollment.find(query)
      .populate('student', 'name rollNumber email department year')
      .populate('course', 'courseName courseCode credits department')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: enrollments.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      data: enrollments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single enrollment by ID
// @route   GET /api/enrollments/:id
// @access  Public
const getEnrollmentById = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('student', 'name rollNumber email department year')
      .populate('course', 'courseName courseCode credits department');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: `Enrollment record with ID ${req.params.id} not found`
      });
    }

    res.status(200).json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new enrollment
// @route   POST /api/enrollments
// @access  Public
const createEnrollment = async (req, res, next) => {
  try {
    const { student, course, enrollmentDate, status } = req.body;

    if (!student || !course) {
      return res.status(400).json({
        success: false,
        message: 'Both student and course IDs are required.'
      });
    }

    // Verify student exists
    const studentDoc = await Student.findById(student);
    if (!studentDoc) {
      return res.status(404).json({
        success: false,
        message: 'Selected student does not exist.'
      });
    }

    // Verify course exists
    const courseDoc = await Course.findById(course);
    if (!courseDoc) {
      return res.status(404).json({
        success: false,
        message: 'Selected course does not exist.'
      });
    }

    // Check duplicate enrollment
    const existingEnrollment = await Enrollment.findOne({ student, course });
    if (existingEnrollment) {
      return res.status(409).json({
        success: false,
        message: `Student '${studentDoc.name}' (${studentDoc.rollNumber}) is already enrolled in '${courseDoc.courseName}'.`
      });
    }

    const newEnrollment = await Enrollment.create({
      student,
      course,
      enrollmentDate: enrollmentDate || new Date(),
      status: status || 'Enrolled'
    });

    const populatedEnrollment = await Enrollment.findById(newEnrollment._id)
      .populate('student', 'name rollNumber email department year')
      .populate('course', 'courseName courseCode credits department');

    res.status(201).json({
      success: true,
      message: 'Student successfully enrolled in course',
      data: populatedEnrollment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update enrollment status or date
// @route   PUT /api/enrollments/:id
// @access  Public
const updateEnrollment = async (req, res, next) => {
  try {
    const { status, enrollmentDate } = req.body;

    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: `Enrollment record with ID ${req.params.id} not found`
      });
    }

    if (status) {
      if (!['Enrolled', 'Completed', 'Dropped'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be Enrolled, Completed, or Dropped'
        });
      }
      enrollment.status = status;
    }

    if (enrollmentDate) {
      enrollment.enrollmentDate = enrollmentDate;
    }

    await enrollment.save();

    const updatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate('student', 'name rollNumber email department year')
      .populate('course', 'courseName courseCode credits department');

    res.status(200).json({
      success: true,
      message: 'Enrollment updated successfully',
      data: updatedEnrollment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete enrollment
// @route   DELETE /api/enrollments/:id
// @access  Public
const deleteEnrollment = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: `Enrollment record with ID ${req.params.id} not found`
      });
    }

    await enrollment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Enrollment record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEnrollments,
  getEnrollmentById,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment
};
