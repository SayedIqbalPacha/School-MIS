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
    searchFields: ['teacherId', 'subjectClassId', 'classAcademicId'],
  })
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate();

  const { documents: allTeacherSubjects, pagination } =
    await features.execute();
  res.status(200).json({
    status: 'success',
    results: allTeacherSubjects.length,
    pagination,
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
