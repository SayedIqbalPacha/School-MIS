const express = require('express');
const teacherSubjectCon = require('../controllers/teacherSubjectCon');
const authCon = require('../controllers/authCon');

const router = express.Router();

router
  .route('/')
  .get(teacherSubjectCon.getAllTeacherSubjects)
  .post(teacherSubjectCon.createTeacherSubject);
router
  .route('/:id')
  .get(teacherSubjectCon.getOneTeacherSubject)
  .patch(
    authCon.protect,
    authCon.restrictTo('manager'),
    teacherSubjectCon.updateTeacherSubject,
  )
  .delete(
    authCon.protect,
    authCon.restrictTo('manager'),
    teacherSubjectCon.deleteTeacherSubject,
  );

module.exports = router;
