const express = require('express');
const studentClassCon = require('../controllers/studentClassCon');

const router = express.Router();

router
  .route('/')
  .get(studentClassCon.getAllStudentClasses)
  .post(studentClassCon.createStudentClass);
router
  .route('/:id')
  .get(studentClassCon.getOneStudentClass)
  .patch(studentClassCon.updateStudentClass)
  .delete(studentClassCon.deleteStudentClass);

module.exports = router;
