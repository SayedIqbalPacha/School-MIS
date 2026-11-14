const express = require('express');
const academicYearCon = require('../controllers/academicYearCon');
const authCon = require('../controllers/authCon');

const router = express.Router();

router
  .route('/')
  .get(academicYearCon.getAllAcademicYears)
  .post(academicYearCon.createAcademicYear);
router
  .route('/:id')
  .get(academicYearCon.getOneAcademicYear)
  .patch(
    authCon.protect,
    authCon.restrictTo('manager'),
    academicYearCon.updateAcademicYear,
  )
  .delete(
    authCon.protect,
    authCon.restrictTo('manager'),
    academicYearCon.deleteAcademicYear,
  );

module.exports = router;
