const express = require('express');
const teacherSubjectCon = require('../controllers/teacherSubjectCon');

const router = express.Router();

router
  .route('/')
  .get(teacherSubjectCon.getAllTeacherSubjects)
  .post(teacherSubjectCon.createTeacherSubject);
router
  .route('/:id')
  .get(teacherSubjectCon.getOneTeacherSubject)
  .patch(teacherSubjectCon.updateTeacherSubject)
  .delete(teacherSubjectCon.deleteTeacherSubject);

module.exports = router;
