const express = require('express');
const subjectClassCon = require('../controllers/subjectClassCon');

const router = express.Router();

router
  .route('/')
  .get(subjectClassCon.getAllSubjectClasses)
  .post(subjectClassCon.createSubjectClass);
router
  .route('/:id')
  .get(subjectClassCon.getOneSubjectClass)
  .patch(subjectClassCon.updateSubjectClass)
  .delete(subjectClassCon.deleteSubjectClass);

module.exports = router;
