const { promisify } = require('util');
const appError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

const getCookieOptions = () => {
  const sameSite = (process.env.JWT_COOKIE_SAME_SITE || 'lax').toLowerCase();

  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || sameSite === 'none',
    sameSite,
    path: '/',
  };
};

// This is used to create token based on id
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// here we make a reusable response for client when we send him token
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  // Here we made a cookie to send the token in a secure cookie,
  // a cookie is text that the server sent that to client and the client can send it back to server with all requests.
  const cookieOptions = {
    ...getCookieOptions(),
    expires: new Date(
      Date.now() + Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000,
    ),
  };
  res.cookie('jwt', token, cookieOptions);

  // dont retunr and send the password in json and cookie response
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    data: { user },
  });
};

exports.logout = (req, res) => {
  res.clearCookie('jwt', getCookieOptions());
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully.',
  });
};

exports.signup = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1 check if the password and email is exist or not
  if (!email || !password) {
    return next(new appError('Please provide email and password', 400));
  }

  //2 check if the user exist and password is correct or not
  // here we call the select on the columns of table that are not allow to see or select them by dfault
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new appError('Incorrect email or password', 401));
  }

  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // The browser sends the HttpOnly JWT cookie automatically with credentials.
  const token = req.cookies?.jwt;

  if (!token) {
    return next(
      new appError('You are not logged in! Please log in to get access.', 401),
    );
  }

  // 2) token verification
  // here we are using promisify to convert the jwt.verify function into a promise so that we can use async await
  //promisify is util's module that is built in nodejs and it is used to convert callback based functions into promise based functions
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3) check if the user still exist
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new appError(
        'The user belonging to this token does no longer exist.',
        401,
      ),
    );
  }

  //4) check if the user changed password after the token was issued
  // iat issued at mean the time that the token was made and issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new appError('User recently changed password! Please log in again.', 401),
    );
  }

  // if we reach here, it means the user is authenticated
  req.user = currentUser;
  next();
});

// AUTHORIAZATION
// ...roles is called rest parameter and used to pass an array of roles to the function
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.roles)) {
      return next(
        new appError('You do not have permission to perform this action', 403),
      );
    }

    next();
  };
};

//  Password forgot
exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) check if user exist based on emial
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new appError('there is no user with this email address', 404));
  }

  //2) generate reset token
  const resetToken = user.createPasswordResetToken();
  // in userModel we changed the passwordExpired time so here we need to save that changes
  await user.save();

  //3) send the reset token to user's email

  const resetURL = `${req.protocol}://${req.get('host')}/api/users/resetPassword/${resetToken}`;
  const message = `Forgot your password submit a new Password with Password Confirm to ${resetURL}.\n if you did not forgot your password please ignore this email`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'your password reset token is valid for 10 min',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new appError(
        'There is an error sending the email, please try again',
        500,
      ),
    );
  }
});

// PASSWORD RESET TOKEN

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1 get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new appError('invalid token or wrong user', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
});

// Updating user password
exports.updatePassword = catchAsync(async (req, res, next) => {
  //1) get user from the collection
  const user = await User.findById(req.user.id).select('+password');

  //2) check if the current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new appError('your current password is wrong.', 401));
  }

  // 3) if everything is correct then run the schema validatoin and do update
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();

  createSendToken(user, 200, res);
});
