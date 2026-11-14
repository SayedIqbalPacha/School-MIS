const subjectModel = require('../models/subjectModel');
const AppError = require('../utils/appError');
const CatchAsync = require('../utils/catchAsync');

// creating subject

exports.createSubject = CatchAsync(async (req, res) => {
  const newSubject = await subjectModel.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      subject: newSubject,
    },
  });
});

//get all subjects

exports.getAllSubjects = CatchAsync(async (req, res) => {
  //1) filtering
  const queryObj = { ...req.query };
  const excludeFields = ['page', 'sort', 'limit', 'fields'];
  // remove excludeFields from queryObj
  excludeFields.forEach((el) => delete queryObj[el]);

  //advanced filtering

  // JSON.stringify() converts object into string
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  // build query
  let query = subjectModel.find(JSON.parse(queryStr));

  //2) sorting
  if (req.query.sort) {
    //split means split based on a comma and then join means join based on a space
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('subjectName');
  }

  //3) field selection
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  } else {
    query = query.select('-updatedAt');
  }

  //4) pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  if (req.query.page) {
    const subjectCount = await subjectModel.countDocuments(
      JSON.parse(queryStr),
    );

    if (subjectCount > 0 && skip >= subjectCount)
      throw new AppError('This page does not exist', 404);
  }

  const allSubjects = await query;
  res.status(200).json({
    status: 'success',
    data: {
      allSubjects,
    },
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
    data: {
      oneSubject,
    },
  });
});

// update subject
exports.updateSubject = CatchAsync(async (req, res, next) => {
  const updatedSubject = await subjectModel.findById(req.params.id);
  if (!updatedSubject)
    return next(new AppError('No subject found with that ID', 404));

  Object.assign(updatedSubject, req.body);
  await updatedSubject.save();
  res.status(200).json({
    status: 'success',
    data: {
      updatedSubject,
    },
  });
});

// delete subject

exports.deleteSubject = CatchAsync(async (req, res) => {
  await subjectModel.findByIdAndDelete(req.params.id);
  res.status(204).send();
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
    data: {
      stats,
    },
  });
});
