const ClassAcademicYear = require('../models/classAcademicYearModel');
const AppError = require('../utils/appError');
const CatchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const deleteIfUnreferenced = require('../utils/deleteIfUnreferenced');

exports.createClassAcademicYear = CatchAsync(async (req, res) => {
  const newClassAcademicYear = await ClassAcademicYear.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { newClassAcademicYear },
  });
});

exports.getAllClassAcademicYears = CatchAsync(async (req, res) => {
  const features = new APIFeatures(ClassAcademicYear.find(), req.query, {
    defaultSort: 'classAcademicName',
    defaultFields: '-updatedAt',
  })
    .filter()
    .sort()
    .limitFields()
    .paginate();

  if (req.query.page) {
    const classAcademicYearCount = await ClassAcademicYear.countDocuments(
      features.filterQuery,
    );
    if (classAcademicYearCount > 0 && features.skip >= classAcademicYearCount) {
      throw new AppError('This page does not exist', 404);
    }
  }

  const allClassAcademicYears = await features.query;
  res.status(200).json({
    status: 'success',
    data: { allClassAcademicYears },
  });
});

exports.getOneClassAcademicYear = CatchAsync(async (req, res, next) => {
  const oneClassAcademicYear = await ClassAcademicYear.findById(req.params.id);
  if (!oneClassAcademicYear) {
    return next(new AppError('No class academic year found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { oneClassAcademicYear },
  });
});

exports.updateClassAcademicYear = CatchAsync(async (req, res, next) => {
  const updatedClassAcademicYear = await ClassAcademicYear.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true },
  );
  if (!updatedClassAcademicYear) {
    return next(new AppError('No class academic year found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { updatedClassAcademicYear },
  });
});

exports.deleteClassAcademicYear = CatchAsync(async (req, res, next) => {
  await deleteIfUnreferenced(
    'ClassAcademicYear',
    ClassAcademicYear,
    req.params.id,
    'class academic year',
  );

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
