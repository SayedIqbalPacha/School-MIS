const SubjectClass = require('../models/subjectClassModel');
const AppError = require('../utils/appError');
const CatchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

exports.createSubjectClass = CatchAsync(async (req, res) => {
  const newSubjectClass = await SubjectClass.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { newSubjectClass },
  });
});

exports.getAllSubjectClasses = CatchAsync(async (req, res) => {
  const features = new APIFeatures(SubjectClass.find(), req.query, {
    defaultSort: 'createdAt',
    defaultFields: '-updatedAt',
    searchFields: ['subjectId', 'classId'],
  })
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate();

  const { documents: allSubjectClasses, pagination } = await features.execute();
  res.status(200).json({
    status: 'success',
    results: allSubjectClasses.length,
    pagination,
    data: { allSubjectClasses },
  });
});

exports.getOneSubjectClass = CatchAsync(async (req, res, next) => {
  const oneSubjectClass = await SubjectClass.findById(req.params.id);
  if (!oneSubjectClass) {
    return next(new AppError('No subject-class link found with that ID', 404));
  }

  res.status(200).json({ status: 'success', data: { oneSubjectClass } });
});

exports.updateSubjectClass = CatchAsync(async (req, res, next) => {
  const updatedSubjectClass = await SubjectClass.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true },
  );
  if (!updatedSubjectClass) {
    return next(new AppError('No subject-class link found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { updatedSubjectClass },
  });
});

exports.deleteSubjectClass = CatchAsync(async (req, res, next) => {
  const subjectClass = await SubjectClass.findByIdAndDelete(req.params.id);
  if (!subjectClass) {
    return next(new AppError('No subject-class link found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
