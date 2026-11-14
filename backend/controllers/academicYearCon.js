const AcademicYear = require('../models/academicYearModel');
const AppError = require('../utils/appError');
const CatchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const deleteIfUnreferenced = require('../utils/deleteIfUnreferenced');

exports.createAcademicYear = CatchAsync(async (req, res) => {
  const newAcademicYear = await AcademicYear.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { newAcademicYear },
  });
});

exports.getAllAcademicYears = CatchAsync(async (req, res) => {
  const features = new APIFeatures(AcademicYear.find(), req.query, {
    defaultSort: 'startDate',
    defaultFields: '-updatedAt',
  })
    .filter()
    .sort()
    .limitFields()
    .paginate();

  if (req.query.page) {
    const academicYearCount = await AcademicYear.countDocuments(
      features.filterQuery,
    );
    if (academicYearCount > 0 && features.skip >= academicYearCount) {
      throw new AppError('This page does not exist', 404);
    }
  }

  const allAcademicYears = await features.query;
  res.status(200).json({ status: 'success', data: { allAcademicYears } });
});

exports.getOneAcademicYear = CatchAsync(async (req, res, next) => {
  const oneAcademicYear = await AcademicYear.findById(req.params.id);
  if (!oneAcademicYear) {
    return next(new AppError('No academic year found with that ID', 404));
  }

  res.status(200).json({ status: 'success', data: { oneAcademicYear } });
});

exports.updateAcademicYear = CatchAsync(async (req, res, next) => {
  const updatedAcademicYear = await AcademicYear.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true },
  );
  if (!updatedAcademicYear) {
    return next(new AppError('No academic year found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { updatedAcademicYear },
  });
});

exports.deleteAcademicYear = CatchAsync(async (req, res, next) => {
  await deleteIfUnreferenced(
    'AcademicYear',
    AcademicYear,
    req.params.id,
    'academic year',
  );

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
