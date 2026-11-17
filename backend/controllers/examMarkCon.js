const ExamMark = require('../models/examMarkModel');
const AppError = require('../utils/appError');
const CatchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

exports.createExamMark = CatchAsync(async (req, res) => {
  const newExamMark = await ExamMark.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { newExamMark },
  });
});

exports.getAllExamMarks = CatchAsync(async (req, res) => {
  const features = new APIFeatures(ExamMark.find(), req.query, {
    defaultSort: 'createdAt',
    defaultFields: '-updatedAt',
    searchFields: [
      'studentId',
      'examId',
      'classAcademicId',
      'teacherSubjectId',
      'marks',
    ],
  })
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate();

  const { documents: allExamMarks, pagination } = await features.execute();
  res.status(200).json({
    status: 'success',
    results: allExamMarks.length,
    pagination,
    data: { allExamMarks },
  });
});

exports.getOneExamMark = CatchAsync(async (req, res, next) => {
  const oneExamMark = await ExamMark.findById(req.params.id);
  if (!oneExamMark) {
    return next(new AppError('No exam mark found with that ID', 404));
  }

  res.status(200).json({ status: 'success', data: { oneExamMark } });
});

exports.updateExamMark = CatchAsync(async (req, res, next) => {
  const updatedExamMark = await ExamMark.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true },
  );
  if (!updatedExamMark) {
    return next(new AppError('No exam mark found with that ID', 404));
  }

  res.status(200).json({ status: 'success', data: { updatedExamMark } });
});

exports.deleteExamMark = CatchAsync(async (req, res, next) => {
  const examMark = await ExamMark.findByIdAndDelete(req.params.id);
  if (!examMark) {
    return next(new AppError('No exam mark found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
