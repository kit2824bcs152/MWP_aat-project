const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student is required']
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required']
    },
    enrollmentDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: {
        values: ['Enrolled', 'Completed', 'Dropped'],
        message: 'Status must be Enrolled, Completed, or Dropped'
      },
      default: 'Enrolled'
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index to prevent duplicate enrollments for the same student in the same course
EnrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', EnrollmentSchema);
