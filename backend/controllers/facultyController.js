const Faculty = require('../models/Faculty');
const Course = require('../models/Course');

// @desc    Get all faculty members with search, filter, and pagination
// @route   GET /api/faculty
// @access  Public
const getFaculty = async (req, res, next) => {
  try {
    const { search, department, page = 1, limit = 10 } = req.query;
    const query = {};

    if (department && department !== 'All') {
      query.department = department;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await Faculty.countDocuments(query);
    const faculty = await Faculty.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: faculty.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      data: faculty
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single faculty member by ID
// @route   GET /api/faculty/:id
// @access  Public
const getFacultyById = async (req, res, next) => {
  try {
    const faculty = await Faculty.findById(req.params.id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: `Faculty member with ID ${req.params.id} not found`
      });
    }

    res.status(200).json({
      success: true,
      data: faculty
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new faculty member
// @route   POST /api/faculty
// @access  Public
const createFaculty = async (req, res, next) => {
  try {
    const { name, employeeId, email, department, specialization } = req.body;

    // Check duplicate employeeId
    const existingEmp = await Faculty.findOne({ employeeId: employeeId?.trim()?.toUpperCase() });
    if (existingEmp) {
      return res.status(409).json({
        success: false,
        message: `Faculty with Employee ID '${employeeId}' already exists.`
      });
    }

    // Check duplicate email
    const existingEmail = await Faculty.findOne({ email: email?.trim()?.toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: `Faculty with email '${email}' already exists.`
      });
    }

    const faculty = await Faculty.create({
      name,
      employeeId,
      email,
      department,
      specialization
    });

    res.status(201).json({
      success: true,
      message: 'Faculty member created successfully',
      data: faculty
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update faculty member
// @route   PUT /api/faculty/:id
// @access  Public
const updateFaculty = async (req, res, next) => {
  try {
    const { name, employeeId, email, department, specialization } = req.body;

    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: `Faculty member with ID ${req.params.id} not found`
      });
    }

    // Check duplicate employeeId if changed
    if (employeeId && employeeId.toUpperCase() !== faculty.employeeId) {
      const duplicateEmp = await Faculty.findOne({
        employeeId: employeeId.trim().toUpperCase(),
        _id: { $ne: req.params.id }
      });
      if (duplicateEmp) {
        return res.status(409).json({
          success: false,
          message: `Employee ID '${employeeId}' is already assigned to another faculty member.`
        });
      }
    }

    // Check duplicate email if changed
    if (email && email.toLowerCase() !== faculty.email) {
      const duplicateEmail = await Faculty.findOne({
        email: email.trim().toLowerCase(),
        _id: { $ne: req.params.id }
      });
      if (duplicateEmail) {
        return res.status(409).json({
          success: false,
          message: `Email '${email}' is already registered with another faculty member.`
        });
      }
    }

    faculty.name = name ?? faculty.name;
    faculty.employeeId = employeeId ? employeeId.toUpperCase() : faculty.employeeId;
    faculty.email = email ? email.toLowerCase() : faculty.email;
    faculty.department = department ?? faculty.department;
    faculty.specialization = specialization ?? faculty.specialization;

    const updatedFaculty = await faculty.save();

    res.status(200).json({
      success: true,
      message: 'Faculty member updated successfully',
      data: updatedFaculty
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete faculty member
// @route   DELETE /api/faculty/:id
// @access  Public
const deleteFaculty = async (req, res, next) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: `Faculty member with ID ${req.params.id} not found`
      });
    }

    // Unassign this faculty from any courses they teach
    await Course.updateMany({ faculty: req.params.id }, { faculty: null });

    await faculty.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Faculty member deleted successfully and courses unassigned.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFaculty,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty
};
