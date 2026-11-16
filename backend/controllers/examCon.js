const Exam = require('../models/examModel');
const AcademicYear = require('../models/academicYearModel');
const AppError = require('../utils/appError');
const CatchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const ExamMark = require('../models/examMarkModel');
const validateReferences = require('../utils/validateReferences');

exports.createExam = CatchAsync(async (req, res) => {
  await validateReferences([
    {
      Model: AcademicYear,
      id: req.body.academicYearId,
      label: 'Academic year',
    },
  ]);
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
  })
    .filter()
    .sort()
    .limitFields()
    .paginate();

  if (req.query.page) {
    const examCount = await Exam.countDocuments(features.filterQuery);
    if (examCount > 0 && features.skip >= examCount) {
      throw new AppError('This page does not exist', 404);
    }
  }

  const allExams = await features.query;
  res.status(200).json({ status: 'success', data: { allExams } });
});

exports.getOneExam = CatchAsync(async (req, res, next) => {
  const oneExam = await Exam.findById(req.params.id);
  if (!oneExam) {
    return next(new AppError('No exam found with that ID', 404));
  }

  res.status(200).json({ status: 'success', data: { oneExam } });
});

exports.updateExam = CatchAsync(async (req, res, next) => {
  await validateReferences([
    {
      Model: AcademicYear,
      id: req.body.academicYearId,
      label: 'Academic year',
    },
  ]);
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
  const exam = await Exam.findById(req.params.id);
  if (!exam) return next(new AppError('No exam found with that ID', 404));

  const hasMarks = await ExamMark.exists({ examId: exam._id });
  if (hasMarks) {
    return next(
      new AppError(
        'Cannot delete this exam because exam marks reference it',
        409,
      ),
    );
  }

  await Exam.findByIdAndDelete(exam._id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
