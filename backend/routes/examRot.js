const express = require('express');
const examCon = require('../controllers/examCon');

const router = express.Router();

router.route('/').get(examCon.getAllExams).post(examCon.createExam);
router
  .route('/:id')
  .get(examCon.getOneExam)
  .patch(examCon.updateExam)
  .delete(examCon.deleteExam);

module.exports = router;
