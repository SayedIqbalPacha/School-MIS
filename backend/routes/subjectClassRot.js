const express = require('express');
const subjectClassCon = require('../controllers/subjectClassCon');
const authCon = require('../controllers/authCon');

const router = express.Router();

router
  .route('/')
  .get(authCon.protect, subjectClassCon.getAllSubjectClasses)
  .post(authCon.protect, subjectClassCon.createSubjectClass);
router
  .route('/:id')
  .get(authCon.protect, subjectClassCon.getOneSubjectClass)
  .patch(
    authCon.protect,
    authCon.restrictTo('manager'),
    subjectClassCon.updateSubjectClass,
  )
  .delete(
    authCon.protect,
    authCon.restrictTo('manager'),
    subjectClassCon.deleteSubjectClass,
  );

module.exports = router;
