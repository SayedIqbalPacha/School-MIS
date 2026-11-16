const express = require('express');
const studentClassCon = require('../controllers/studentClassCon');
const authCon = require('../controllers/authCon');

const router = express.Router();

router
  .route('/')
  .get(authCon.protect, studentClassCon.getAllStudentClasses)
  .post(authCon.protect, studentClassCon.createStudentClass);
router
  .route('/:id')
  .get(authCon.protect, studentClassCon.getOneStudentClass)
  .patch(
    authCon.protect,
    authCon.restrictTo('manager'),
    studentClassCon.updateStudentClass,
  )
  .delete(
    authCon.protect,
    authCon.restrictTo('manager'),
    studentClassCon.deleteStudentClass,
  );

module.exports = router;
