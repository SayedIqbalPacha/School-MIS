const Student = require('../models/studentModel');
const AppError = require('../utils/appError');
const CatchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

exports.createStudent = CatchAsync(async (req, res) => {
  const newStudent = await Student.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { newStudent },
  });
});

exports.getAllStudents = CatchAsync(async (req, res) => {
  const features = new APIFeatures(Student.find(), req.query, {
    defaultSort: 'firstName',
    defaultFields: '-updatedAt',
    searchFields: ['firstName', 'lastName', 'email', 'phone', 'parentName'],
  })
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate();

  const { documents: allStudents, pagination } = await features.execute();
  res.status(200).json({
    status: 'success',
    results: allStudents.length,
    pagination,
    data: { allStudents },
  });
});

exports.getOneStudent = CatchAsync(async (req, res, next) => {
  const oneStudent = await Student.findById(req.params.id);
  if (!oneStudent) {
    return next(new AppError('No student found with that ID', 404));
  }

  res.status(200).json({ status: 'success', data: { oneStudent } });
});

exports.updateStudent = CatchAsync(async (req, res, next) => {
  if (
    Object.prototype.hasOwnProperty.call(req.body, 'active') &&
    req.body.active !== true
  ) {
    return next(new AppError('Use DELETE to deactivate a student', 400));
  }

  const updatedStudent = await Student.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true },
  ).setOptions({ includeInactive: true });
  if (!updatedStudent) {
    return next(new AppError('No student found with that ID', 404));
  }

  res.status(200).json({ status: 'success', data: { updatedStudent } });
});

exports.deleteStudent = CatchAsync(async (req, res, next) => {
  const student = await Student.findOneAndUpdate(
    { _id: req.params.id, active: { $ne: false } },
    { $set: { active: false } },
    { new: true, runValidators: true },
  ).setOptions({ includeInactive: true });
  if (!student) return next(new AppError('No student found with that ID', 404));

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
