const express = require('express');
const academicYearCon = require('../controllers/academicYearCon');
const authCon = require('../controllers/authCon');

const router = express.Router();

router
  .route('/')
  .get(authCon.protect, academicYearCon.getAllAcademicYears)
  .post(authCon.protect, academicYearCon.createAcademicYear);
router
  .route('/:id')
  .get(authCon.protect, academicYearCon.getOneAcademicYear)
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
