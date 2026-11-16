const express = require('express');
const subjectCon = require('../controllers/subjectCon');
const authCon = require('../controllers/authCon');

const router = express.Router();

router.post(
  '/',
  authCon.protect,
  authCon.restrictTo('manager'),
  subjectCon.createSubject,
);

router.get('/', authCon.protect, subjectCon.getAllSubjects);

router.get('/stats', authCon.protect, subjectCon.getSubjectStats);

router.get('/:id', authCon.protect, subjectCon.getOneSubject);

router.patch(
  '/:id',
  authCon.protect,
  authCon.restrictTo('manager'),
  subjectCon.updateSubject,
);

router.delete(
  '/:id',
  authCon.protect,
  authCon.restrictTo('manager'),
  subjectCon.deleteSubject,
);

module.exports = router;
