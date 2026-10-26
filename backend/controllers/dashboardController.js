const Course = require('../models/Course');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Enrollment = require('../models/Enrollment');

// @desc    Get aggregated dashboard stats and chart data
// @route   GET /api/dashboard/stats
// @access  Public
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalCourses,
      totalStudents,
      totalFaculty,
      totalEnrollments,
      coursesByDepartment,
      enrollmentsByStatus,
      recentCourses,
      recentEnrollments,
      studentsByYear
    ] = await Promise.all([
      Course.countDocuments(),
      Student.countDocuments(),
      Faculty.countDocuments(),
      Enrollment.countDocuments(),

      // Aggregate courses by department
      Course.aggregate([
        {
          $group: {
            _id: '$department',
            count: { $sum: 1 },
            avgCredits: { $avg: '$credits' }
          }
        },
        { $sort: { count: -1 } }
      ]),

      // Aggregate enrollments by status
      Enrollment.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),

      // 5 most recently created courses
      Course.find()
        .populate('faculty', 'name employeeId')
        .sort({ createdAt: -1 })
        .limit(5),

      // 5 most recent enrollments
      Enrollment.find()
        .populate('student', 'name rollNumber email')
        .populate('course', 'courseName courseCode credits')
        .sort({ createdAt: -1 })
        .limit(5),

      // Aggregate students by year of study
      Student.aggregate([
        {
          $group: {
            _id: '$year',
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    // Format department distribution for charting
    const departmentChartData = coursesByDepartment.map((item) => ({
      department: item._id || 'Unassigned',
      courses: item.count,
      avgCredits: Number(item.avgCredits.toFixed(1))
    }));

    // Format status distribution for charting
    const statusChartData = enrollmentsByStatus.map((item) => ({
      status: item._id,
      count: item.count
    }));

    // Format student year distribution
    const yearChartData = studentsByYear.map((item) => ({
      year: `Year ${item._id}`,
      count: item.count
    }));

    // Distinct list of departments for frontend dropdowns
    const distinctDepartments = await Course.distinct('department');

    res.status(200).json({
      success: true,
      data: {
        totals: {
          courses: totalCourses,
          students: totalStudents,
          faculty: totalFaculty,
          enrollments: totalEnrollments
        },
        charts: {
          coursesByDepartment: departmentChartData,
          enrollmentsByStatus: statusChartData,
          studentsByYear: yearChartData
        },
        recentCourses,
        recentEnrollments,
        departments: distinctDepartments
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats
};
