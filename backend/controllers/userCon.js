const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

// is the allowedFields is a keyword?
const filterdObject = (obj, ...allowedFields) => {
  const newObj = {};
  //Object.Keys is the best functoin to run and loop through the elements of an object
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// get all users
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const sensitiveFields = new Set([
    'password',
    'passwordConfirm',
    'passwordResetToken',
    'passwordResetExpires',
    'passwordChangedAt',
  ]);

  if (typeof req.query.fields === 'string') {
    const requestedSensitiveFields = req.query.fields
      .split(',')
      .map((field) => field.trim())
      .filter((field) => sensitiveFields.has(field.replace(/^\+/, '')));

    if (requestedSensitiveFields.length) {
      return next(
        new AppError('Sensitive user fields cannot be selected', 400),
      );
    }
  }

  const features = new APIFeatures(User.find(), req.query, {
    defaultSort: 'name',
    defaultFields:
      '-__v -password -passwordConfirm -passwordResetToken -passwordResetExpires -passwordChangedAt',
    baseFilter: { active: { $ne: false } },
    searchFields: ['name', 'email', 'roles'],
  })
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate();

  const { documents: users, pagination } = await features.execute();

  res.status(200).json({
    status: 'success',
    results: users.length,
    pagination,
    data: { users },
  });
});

// get one user
exports.getOneUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

// Update a user's non-password fields. This route is restricted to managers.
exports.updateUser = catchAsync(async (req, res, next) => {
  const filteredBody = filterdObject(req.body, 'name', 'email', 'roles');
  const user = await User.findByIdAndUpdate(req.params.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  if (!user) return next(new AppError('No user found with that ID', 404));

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

// Permanently delete a user. This route is restricted to managers.
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// UPDATEME
exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400,
      ),
    );
  }
  const filterdBody = filterdObject(req.body, 'name', 'email');

  const updateUser = await User.findByIdAndUpdate(req.user.id, filterdBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: { updateUser },
  });
});

//DeleteME

exports.deleteME = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
