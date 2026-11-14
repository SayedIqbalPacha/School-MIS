const express = require('express');
const examCon = require('../controllers/examCon');
const authCon = require('../controllers/authCon');

const router = express.Router();

router.route('/').get(examCon.getAllExams).post(examCon.createExam);
router
  .route('/:id')
  .get(examCon.getOneExam)
  .patch(authCon.protect, authCon.restrictTo('manager'), examCon.updateExam)
  .delete(authCon.protect, authCon.restrictTo('manager'), examCon.deleteExam);

module.exports = router;
