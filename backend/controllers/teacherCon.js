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
    searchFields: ['teacherName', 'teacherLast', 'email', 'phone'],
  })
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate();

  const { documents: allTeachers, pagination } = await features.execute();
  res.status(200).json({
    status: 'success',
    results: allTeachers.length,
    pagination,
    data: { allTeachers },
  });
});

exports.getOneTeacher = CatchAsync(async (req, res, next) => {
  const oneTeacher = await Teacher.findById(req.params.id);
  if (!oneTeacher) {
    return next(new AppError('No teacher found with that ID', 404));
  }

  res.status(200).json({ status: 'success', data: { oneTeacher } });
});

exports.updateTeacher = CatchAsync(async (req, res, next) => {
  if (
    Object.prototype.hasOwnProperty.call(req.body, 'active') &&
    req.body.active !== true
  ) {
    return next(new AppError('Use DELETE to deactivate a teacher', 400));
  }

  const updatedTeacher = await Teacher.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true },
  ).setOptions({ includeInactive: true });
  if (!updatedTeacher) {
    return next(new AppError('No teacher found with that ID', 404));
  }

  res.status(200).json({ status: 'success', data: { updatedTeacher } });
});

exports.deleteTeacher = CatchAsync(async (req, res, next) => {
  const teacher = await Teacher.findOneAndUpdate(
    { _id: req.params.id, active: { $ne: false } },
    { $set: { active: false } },
    { new: true, runValidators: true },
  ).setOptions({ includeInactive: true });
  if (!teacher) return next(new AppError('No teacher found with that ID', 404));

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
