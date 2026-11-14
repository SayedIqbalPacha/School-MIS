const express = require('express');
const classAcademicYearCon = require('../controllers/classAcademicYearCon');

const router = express.Router();

router
  .route('/')
  .get(classAcademicYearCon.getAllClassAcademicYears)
  .post(classAcademicYearCon.createClassAcademicYear);
router
  .route('/:id')
  .get(classAcademicYearCon.getOneClassAcademicYear)
  .patch(classAcademicYearCon.updateClassAcademicYear)
  .delete(classAcademicYearCon.deleteClassAcademicYear);

module.exports = router;
