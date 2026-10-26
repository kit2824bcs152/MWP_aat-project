const Student = require('../models/Student');
const Enrollment = require('../models/Enrollment');

// @desc    Get all students with search, filter, and pagination
// @route   GET /api/students
// @access  Public
const getStudents = async (req, res, next) => {
  try {
    const { search, department, year, page = 1, limit = 10 } = req.query;
    const query = {};

    if (department && department !== 'All') {
      query.department = department;
    }

    if (year && year !== 'All') {
      query.year = parseInt(year, 10);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: students.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      data: students
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student by ID with their enrollments
// @route   GET /api/students/:id
// @access  Public
const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student with ID ${req.params.id} not found`
      });
    }

    const enrollments = await Enrollment.find({ student: req.params.id })
      .populate('course')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: student,
      enrollments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new student
// @route   POST /api/students
// @access  Public
const createStudent = async (req, res, next) => {
  try {
    const { name, rollNumber, email, department, year } = req.body;

    // Check duplicate rollNumber
    const existingRoll = await Student.findOne({ rollNumber: rollNumber?.trim()?.toUpperCase() });
    if (existingRoll) {
      return res.status(409).json({
        success: false,
        message: `Student with roll number '${rollNumber}' already exists.`
      });
    }

    // Check duplicate email
    const existingEmail = await Student.findOne({ email: email?.trim()?.toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: `Student with email '${email}' already exists.`
      });
    }

    const student = await Student.create({
      name,
      rollNumber,
      email,
      department,
      year: Number(year)
    });

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: student
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Public
const updateStudent = async (req, res, next) => {
  try {
    const { name, rollNumber, email, department, year } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student with ID ${req.params.id} not found`
      });
    }

    // Check duplicate rollNumber if changed
    if (rollNumber && rollNumber.toUpperCase() !== student.rollNumber) {
      const duplicateRoll = await Student.findOne({
        rollNumber: rollNumber.trim().toUpperCase(),
        _id: { $ne: req.params.id }
      });
      if (duplicateRoll) {
        return res.status(409).json({
          success: false,
          message: `Roll number '${rollNumber}' is already registered with another student.`
        });
      }
    }

    // Check duplicate email if changed
    if (email && email.toLowerCase() !== student.email) {
      const duplicateEmail = await Student.findOne({
        email: email.trim().toLowerCase(),
        _id: { $ne: req.params.id }
      });
      if (duplicateEmail) {
        return res.status(409).json({
          success: false,
          message: `Email '${email}' is already registered with another student.`
        });
      }
    }

    student.name = name ?? student.name;
    student.rollNumber = rollNumber ? rollNumber.toUpperCase() : student.rollNumber;
    student.email = email ? email.toLowerCase() : student.email;
    student.department = department ?? student.department;
    student.year = year !== undefined ? Number(year) : student.year;

    const updatedStudent = await student.save();

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student and their enrollments
// @route   DELETE /api/students/:id
// @access  Public
const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student with ID ${req.params.id} not found`
      });
    }

    // Remove enrollments associated with this student
    await Enrollment.deleteMany({ student: req.params.id });

    await student.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Student and associated enrollment records deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
};
