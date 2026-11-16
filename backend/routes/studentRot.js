const express = require('express');
const studentCon = require('../controllers/studentCon');
const authCon = require('../controllers/authCon');

const router = express.Router();

router
  .route('/')
  .get(authCon.protect, studentCon.getAllStudents)
  .post(authCon.protect, studentCon.createStudent);
router
  .route('/:id')
  .get(authCon.protect, studentCon.getOneStudent)
  .patch(
    authCon.protect,
    authCon.restrictTo('manager'),
    studentCon.updateStudent,
  )
  .delete(
    authCon.protect,
    authCon.restrictTo('manager'),
    studentCon.deleteStudent,
  );

module.exports = router;
