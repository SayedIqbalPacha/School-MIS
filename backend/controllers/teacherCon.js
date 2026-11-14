const Teacher = require('../models/teacherModel');
const AppError = require('../utils/appError');
const CatchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

exports.createTeacher = CatchAsync(async (req, res) => {
  const newTeacher = await Teacher.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { newTeacher },
  });
});

exports.getAllTeachers = CatchAsync(async (req, res) => {
  const features = new APIFeatures(Teacher.find(), req.query, {
    defaultSort: 'teacherName',
    defaultFields: '-updatedAt',
  })
    .filter()
    .sort()
    .limitFields()
    .paginate();

  if (req.query.page) {
    const teacherCount = await Teacher.countDocuments(features.filterQuery);
    if (teacherCount > 0 && features.skip >= teacherCount) {
      throw new AppError('This page does not exist', 404);
    }
  }

  const allTeachers = await features.query;
  res.status(200).json({ status: 'success', data: { allTeachers } });
});

exports.getOneTeacher = CatchAsync(async (req, res, next) => {
  const oneTeacher = await Teacher.findById(req.params.id);
  if (!oneTeacher) {
    return next(new AppError('No teacher found with that ID', 404));
  }

  res.status(200).json({ status: 'success', data: { oneTeacher } });
});

exports.updateTeacher = CatchAsync(async (req, res, next) => {
  const updatedTeacher = await Teacher.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true },
  );
  if (!updatedTeacher) {
    return next(new AppError('No teacher found with that ID', 404));
  }

  res.status(200).json({ status: 'success', data: { updatedTeacher } });
});

exports.deleteTeacher = CatchAsync(async (req, res, next) => {
  const teacher = await Teacher.findByIdAndDelete(req.params.id);
  if (!teacher) {
    return next(new AppError('No teacher found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
