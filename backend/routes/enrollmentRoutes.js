const express = require('express');
const router = express.Router();
const {
  getEnrollments,
  getEnrollmentById,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment
} = require('../controllers/enrollmentController');

router.route('/')
  .get(getEnrollments)
  .post(createEnrollment);

router.route('/:id')
  .get(getEnrollmentById)
  .put(updateEnrollment)
  .delete(deleteEnrollment);

module.exports = router;
