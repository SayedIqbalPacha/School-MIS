const Exam = require('../models/examModel');
const AppError = require('../utils/appError');
const CatchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

exports.createExam = CatchAsync(async (req, res) => {
  const newExam = await Exam.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { newExam },
  });
});

exports.getAllExams = CatchAsync(async (req, res) => {
  const features = new APIFeatures(Exam.find(), req.query, {
    defaultSort: 'startDate',
    defaultFields: '-updatedAt',
    searchFields: ['examName', 'examType'],
  })
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate();

  const { documents: allExams, pagination } = await features.execute();
  res.status(200).json({
    status: 'success',
    results: allExams.length,
    pagination,
    data: { allExams },
  });
});

exports.getOneExam = CatchAsync(async (req, res, next) => {
  const oneExam = await Exam.findById(req.params.id);
  if (!oneExam) {
    return next(new AppError('No exam found with that ID', 404));
  }

  res.status(200).json({ status: 'success', data: { oneExam } });
});

exports.updateExam = CatchAsync(async (req, res, next) => {
  const updatedExam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!updatedExam) {
    return next(new AppError('No exam found with that ID', 404));
  }

  res.status(200).json({ status: 'success', data: { updatedExam } });
});

exports.deleteExam = CatchAsync(async (req, res, next) => {
  const exam = await Exam.findByIdAndDelete(req.params.id);
  if (!exam) return next(new AppError('No exam found with that ID', 404));

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
