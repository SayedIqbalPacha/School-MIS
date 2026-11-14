const express = require('express');
const classCon = require('../controllers/classCon');

const router = express.Router();

router.route('/').get(classCon.getAllClasses).post(classCon.createClass);
router
  .route('/:id')
  .get(classCon.getOneClass)
  .patch(classCon.updateClass)
  .delete(classCon.deleteClass);

module.exports = router;
