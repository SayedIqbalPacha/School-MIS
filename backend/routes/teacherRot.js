const express = require('express');
const teacherCon = require('../controllers/teacherCon');
const authCon = require('../controllers/authCon');

const router = express.Router();

router
  .route('/')
  .get(authCon.protect, teacherCon.getAllTeachers)
  .post(authCon.protect, teacherCon.createTeacher);
router
  .route('/:id')
  .get(authCon.protect, teacherCon.getOneTeacher)
  .patch(
    authCon.protect,
    authCon.restrictTo('manager'),
    teacherCon.updateTeacher,
  )
  .delete(
    authCon.protect,
    authCon.restrictTo('manager'),
    teacherCon.deleteTeacher,
  );

module.exports = router;
