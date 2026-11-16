const express = require('express');
const classAcademicYearCon = require('../controllers/classAcademicYearCon');
const authCon = require('../controllers/authCon');

const router = express.Router();

router
  .route('/')
  .get(authCon.protect, classAcademicYearCon.getAllClassAcademicYears)
  .post(authCon.protect, classAcademicYearCon.createClassAcademicYear);
router
  .route('/:id')
  .get(authCon.protect, classAcademicYearCon.getOneClassAcademicYear)
  .patch(
    authCon.protect,
    authCon.restrictTo('manager'),
    classAcademicYearCon.updateClassAcademicYear,
  )
  .delete(
    authCon.protect,
    authCon.restrictTo('manager'),
    classAcademicYearCon.deleteClassAcademicYear,
  );

module.exports = router;
