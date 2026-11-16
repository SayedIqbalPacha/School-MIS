const express = require('express');
const authCon = require('../controllers/authCon');
const userCon = require('../controllers/userCon');

const router = express.Router();

router.post('/signup', authCon.signup);
router.post('/login', authCon.login);
router.post('/forgotPassword', authCon.forgotPassword);
router.patch('/resetPassword/:token', authCon.resetPassword);
router.patch('/updateMyPassword', authCon.protect, authCon.updatePassword);
router.patch(
  '/updateME',
  authCon.protect,
  authCon.restrictTo('manager'),
  userCon.updateMe,
);
router.delete(
  '/deleteMe',
  authCon.protect,
  authCon.restrictTo('manager'),
  userCon.deleteME,
);

router
  .route('/')
  .get(authCon.protect, authCon.restrictTo('manager'), userCon.getAllUsers);

router
  .route('/:id')
  .get(authCon.protect, authCon.restrictTo('manager'), userCon.getOneUser)
  .patch(authCon.protect, authCon.restrictTo('manager'), userCon.updateUser)
  .delete(authCon.protect, authCon.restrictTo('manager'), userCon.deleteUser);

module.exports = router;
