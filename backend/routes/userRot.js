const express = require('express');
const authCon = require('../controllers/authCon');
const userCon = require('../controllers/userCon');

const router = express.Router();

router.post('/signup', authCon.signup);
router.post('/login', authCon.login);
router.post('/forgotPassword', authCon.forgotPassword);
router.patch('/resetPassword/:token', authCon.reserPassword);
router.patch('/updateMyPassword', authCon.protect, authCon.updatePassword);
router.patch('/updateME', authCon.protect, userCon.updateMe);
router.delete('/deleteMe', authCon.protect, userCon.deleteME);

router.route('/').get(userCon.getAllUsers);

router
  .route('/:id')
  .get(userCon.getOneUser)
  .patch(authCon.protect, userCon.updateUser)
  .delete(authCon.protect, userCon.deleteUser);

module.exports = router;
