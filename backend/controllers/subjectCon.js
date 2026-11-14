const subjectModel = require('../models/subjectModel');
const AppError = require('../utils/appError');
const CatchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const deleteIfUnreferenced = require('../utils/deleteIfUnreferenced');

// creating subject

exports.createSubject = CatchAsync(async (req, res) => {
  const newSubject = await subjectModel.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { newSubject },
  });
});

//get all subjects

exports.getAllSubjects = CatchAsync(async (req, res) => {
  const features = new APIFeatures(subjectModel.find(), req.query, {
    defaultSort: 'subjectName',
    defaultFields: '-updatedAt',
  })
    .filter()
    .sort()
    .limitFields()
    .paginate();

  if (req.query.page) {
    const subjectCount = await subjectModel.countDocuments(
      features.filterQuery,
    );

    if (subjectCount > 0 && features.skip >= subjectCount)
      throw new AppError('This page does not exist', 404);
  }

  const allSubjects = await features.query;
  res.status(200).json({
    status: 'success',
    data: { allSubjects },
  });
});

//get one subject

exports.getOneSubject = CatchAsync(async (req, res, next) => {
  const oneSubject = await subjectModel.findById(req.params.id);
  if (!oneSubject)
    return next(new AppError('No subject found with that ID', 404));
  // subjectModel.findOne({_id: req.params.id}) is same to findById
  res.status(200).json({
    status: 'success',
    data: { oneSubject },
  });
});

// update subject
exports.updateSubject = CatchAsync(async (req, res, next) => {
  const updatedSubject = await subjectModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );
  if (!updatedSubject)
    return next(new AppError('No subject found with that ID', 404));

  res.status(200).json({
    status: 'success',
    data: { updatedSubject },
  });
});

// delete subject

exports.deleteSubject = CatchAsync(async (req, res, next) => {
  await deleteIfUnreferenced('Subject', subjectModel, req.params.id, 'subject');

  return res.status(204).json({
    status: 'success',
    data: null,
  });
});

// here we are using aggregation pipeline to get the subject stats. aggregation pipeline is a framework for data aggregation modeled on the concept of data processing pipelines. Documents enter a multi-stage pipeline that transforms the documents into aggregated results.
exports.getSubjectStats = CatchAsync(async (req, res) => {
  const stats = await subjectModel.aggregate([
    // match is always used to filter the documents based on some conditions.
    {
      $match: {
        creditHours: { $gte: 1 },
      },
    },
    // group is used to group the documents based on some conditions
    {
      $group: {
        _id: '$creditHours',
        totalSubjects: { $sum: 1 },
        // Push each subject's name into the array
        subjectNames: { $push: '$subjectName' },
      },
    },
    // here we sort the documents based on the _id field in ascending order.
    //  if we want to sort in descending order then we can use -1 instead of 1.
    {
      $sort: { _id: 1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: stats.length,
    data: { stats },
  });
});
