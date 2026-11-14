const express = require('express');
const examMarkCon = require('../controllers/examMarkCon');

const router = express.Router();

router
  .route('/')
  .get(examMarkCon.getAllExamMarks)
  .post(examMarkCon.createExamMark);
router
  .route('/:id')
  .get(examMarkCon.getOneExamMark)
  .patch(examMarkCon.updateExamMark)
  .delete(examMarkCon.deleteExamMark);

module.exports = router;
