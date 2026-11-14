const express = require('express');
const academicYearCon = require('../controllers/academicYearCon');

const router = express.Router();

router
  .route('/')
  .get(academicYearCon.getAllAcademicYears)
  .post(academicYearCon.createAcademicYear);
router
  .route('/:id')
  .get(academicYearCon.getOneAcademicYear)
  .patch(academicYearCon.updateAcademicYear)
  .delete(academicYearCon.deleteAcademicYear);

module.exports = router;
