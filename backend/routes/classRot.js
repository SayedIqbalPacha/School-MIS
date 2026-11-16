const express = require('express');
const classCon = require('../controllers/classCon');
const authCon = require('../controllers/authCon');

const router = express.Router();

router
  .route('/')
  .get(authCon.protect, classCon.getAllClasses)
  .post(authCon.protect, classCon.createClass);
router
  .route('/:id')
  .get(authCon.protect, classCon.getOneClass)
  .patch(authCon.protect, authCon.restrictTo('manager'), classCon.updateClass)
  .delete(authCon.protect, authCon.restrictTo('manager'), classCon.deleteClass);

module.exports = router;
