const Student = require('../models/studentModel');
const AppError = require('../utils/appError');
const CatchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const deleteIfUnreferenced = require('../utils/deleteIfUnreferenced');

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
  })
    .filter()
    .sort()
    .limitFields()
    .paginate();

  if (req.query.page) {
    const studentCount = await Student.countDocuments(features.filterQuery);
    if (studentCount > 0 && features.skip >= studentCount) {
      throw new AppError('This page does not exist', 404);
    }
  }

  const allStudents = await features.query;
  res.status(200).json({ status: 'success', data: { allStudents } });
});

exports.getOneStudent = CatchAsync(async (req, res, next) => {
  const oneStudent = await Student.findById(req.params.id);
  if (!oneStudent) {
    return next(new AppError('No student found with that ID', 404));
  }

  res.status(200).json({ status: 'success', data: { oneStudent } });
});

exports.updateStudent = CatchAsync(async (req, res, next) => {
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
  await deleteIfUnreferenced('Student', Student, req.params.id, 'student');

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
