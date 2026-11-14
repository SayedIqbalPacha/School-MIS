const TeacherSubject = require('../models/teacherSubjectModel');
const AppError = require('../utils/appError');
const CatchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

exports.createTeacherSubject = CatchAsync(async (req, res) => {
  const newTeacherSubject = await TeacherSubject.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { newTeacherSubject },
  });
});

exports.getAllTeacherSubjects = CatchAsync(async (req, res) => {
  const features = new APIFeatures(TeacherSubject.find(), req.query, {
    defaultSort: 'createdAt',
    defaultFields: '-updatedAt',
  })
    .filter()
    .sort()
    .limitFields()
    .paginate();

  if (req.query.page) {
    const teacherSubjectCount = await TeacherSubject.countDocuments(
      features.filterQuery,
    );
    if (teacherSubjectCount > 0 && features.skip >= teacherSubjectCount) {
      throw new AppError('This page does not exist', 404);
    }
  }

  const allTeacherSubjects = await features.query;
  res.status(200).json({
    status: 'success',
    data: { allTeacherSubjects },
  });
});

exports.getOneTeacherSubject = CatchAsync(async (req, res, next) => {
  const oneTeacherSubject = await TeacherSubject.findById(req.params.id);
  if (!oneTeacherSubject) {
    return next(
      new AppError('No teacher-subject assignment found with that ID', 404),
    );
  }

  res.status(200).json({ status: 'success', data: { oneTeacherSubject } });
});

exports.updateTeacherSubject = CatchAsync(async (req, res, next) => {
  const updatedTeacherSubject = await TeacherSubject.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true },
  );
  if (!updatedTeacherSubject) {
    return next(
      new AppError('No teacher-subject assignment found with that ID', 404),
    );
  }

  res.status(200).json({
    status: 'success',
    data: { updatedTeacherSubject },
  });
});

exports.deleteTeacherSubject = CatchAsync(async (req, res, next) => {
  const teacherSubject = await TeacherSubject.findByIdAndDelete(req.params.id);
  if (!teacherSubject) {
    return next(
      new AppError('No teacher-subject assignment found with that ID', 404),
    );
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
