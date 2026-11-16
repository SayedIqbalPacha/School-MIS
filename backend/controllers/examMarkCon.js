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
  })
    .filter()
    .sort()
    .limitFields()
    .paginate();

  if (req.query.page) {
    const examMarkCount = await ExamMark.countDocuments(features.filterQuery);
    if (examMarkCount > 0 && features.skip >= examMarkCount) {
      throw new AppError('This page does not exist', 404);
    }
  }

  const allExamMarks = await features.query;
  res.status(200).json({ status: 'success', data: { allExamMarks } });
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
