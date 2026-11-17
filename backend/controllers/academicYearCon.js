const AcademicYear = require('../models/academicYearModel');
const AppError = require('../utils/appError');
const CatchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

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
    searchFields: ['academicYearName'],
  })
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate();

  const { documents: allAcademicYears, pagination } = await features.execute();
  res.status(200).json({
    status: 'success',
    results: allAcademicYears.length,
    pagination,
    data: { allAcademicYears },
  });
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
  const academicYear = await AcademicYear.findByIdAndDelete(req.params.id);
  if (!academicYear) {
    return next(new AppError('No academic year found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
