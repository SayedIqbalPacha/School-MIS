const express = require('express');
const studentCon = require('../controllers/studentCon');

const router = express.Router();

router.route('/').get(studentCon.getAllStudents).post(studentCon.createStudent);
router
  .route('/:id')
  .get(studentCon.getOneStudent)
  .patch(studentCon.updateStudent)
  .delete(studentCon.deleteStudent);

module.exports = router;
