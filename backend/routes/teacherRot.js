const express = require('express');
const teacherCon = require('../controllers/teacherCon');

const router = express.Router();

router.route('/').get(teacherCon.getAllTeachers).post(teacherCon.createTeacher);
router
  .route('/:id')
  .get(teacherCon.getOneTeacher)
  .patch(teacherCon.updateTeacher)
  .delete(teacherCon.deleteTeacher);

module.exports = router;
