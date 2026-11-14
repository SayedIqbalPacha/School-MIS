const SchoolClass = require('../models/classModel');
const AppError = require('../utils/appError');
const CatchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

exports.createClass = CatchAsync(async (req, res) => {
  const newClass = await SchoolClass.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { newClass },
  });
});

exports.getAllClasses = CatchAsync(async (req, res) => {
  const features = new APIFeatures(SchoolClass.find(), req.query, {
    defaultSort: 'className',
    defaultFields: '-updatedAt',
  })
    .filter()
    .sort()
    .limitFields()
    .paginate();

  if (req.query.page) {
    const classCount = await SchoolClass.countDocuments(features.filterQuery);
    if (classCount > 0 && features.skip >= classCount) {
      throw new AppError('This page does not exist', 404);
    }
  }

  const allClasses = await features.query;
  res.status(200).json({ status: 'success', data: { allClasses } });
});

exports.getOneClass = CatchAsync(async (req, res, next) => {
  const oneClass = await SchoolClass.findById(req.params.id);
  if (!oneClass) {
    return next(new AppError('No class found with that ID', 404));
  }

  res.status(200).json({ status: 'success', data: { oneClass } });
});

exports.updateClass = CatchAsync(async (req, res, next) => {
  const updatedClass = await SchoolClass.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true },
  );
  if (!updatedClass) {
    return next(new AppError('No class found with that ID', 404));
  }

  res.status(200).json({ status: 'success', data: { updatedClass } });
});

exports.deleteClass = CatchAsync(async (req, res, next) => {
  const schoolClass = await SchoolClass.findByIdAndDelete(req.params.id);
  if (!schoolClass) {
    return next(new AppError('No class found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
