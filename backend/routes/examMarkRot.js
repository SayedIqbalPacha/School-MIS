const express = require('express');
const examMarkCon = require('../controllers/examMarkCon');
const authCon = require('../controllers/authCon');

const router = express.Router();

router
  .route('/')
  .get(authCon.protect, examMarkCon.getAllExamMarks)
  .post(authCon.protect, examMarkCon.createExamMark);
router
  .route('/:id')
  .get(authCon.protect, examMarkCon.getOneExamMark)
  .patch(
    authCon.protect,
    authCon.restrictTo('manager'),
    examMarkCon.updateExamMark,
  )
  .delete(
    authCon.protect,
    authCon.restrictTo('manager'),
    examMarkCon.deleteExamMark,
  );

module.exports = router;
