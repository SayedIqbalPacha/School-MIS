const StudentClass = require('../models/studentClassModel');
const AppError = require('../utils/appError');
const CatchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

exports.createStudentClass = CatchAsync(async (req, res) => {
  const newStudentClass = await StudentClass.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { newStudentClass },
  });
});

exports.getAllStudentClasses = CatchAsync(async (req, res) => {
  const features = new APIFeatures(StudentClass.find(), req.query, {
    defaultSort: 'createdAt',
    defaultFields: '-updatedAt',
  })
    .filter()
    .sort()
    .limitFields()
    .paginate();

  if (req.query.page) {
    const studentClassCount = await StudentClass.countDocuments(
      features.filterQuery,
    );
    if (studentClassCount > 0 && features.skip >= studentClassCount) {
      throw new AppError('This page does not exist', 404);
    }
  }

  const allStudentClasses = await features.query;
  res.status(200).json({
    status: 'success',
    data: { allStudentClasses },
  });
});

exports.getOneStudentClass = CatchAsync(async (req, res, next) => {
  const oneStudentClass = await StudentClass.findById(req.params.id);
  if (!oneStudentClass) {
    return next(new AppError('No student-class link found with that ID', 404));
  }

  res.status(200).json({ status: 'success', data: { oneStudentClass } });
});

exports.updateStudentClass = CatchAsync(async (req, res, next) => {
  const updatedStudentClass = await StudentClass.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true },
  );
  if (!updatedStudentClass) {
    return next(new AppError('No student-class link found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { updatedStudentClass },
  });
});

exports.deleteStudentClass = CatchAsync(async (req, res, next) => {
  const studentClass = await StudentClass.findByIdAndDelete(req.params.id);
  if (!studentClass) {
    return next(new AppError('No student-class link found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
