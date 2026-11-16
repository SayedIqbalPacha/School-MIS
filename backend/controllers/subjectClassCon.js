const SubjectClass = require('../models/subjectClassModel');
const AppError = require('../utils/appError');
const CatchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const TeacherSubject = require('../models/teacherSubjectModel');
const Subject = require('../models/subjectModel');
const SchoolClass = require('../models/classModel');
const validateReferences = require('../utils/validateReferences');

exports.createSubjectClass = CatchAsync(async (req, res) => {
  await validateReferences([
    { Model: Subject, id: req.body.subjectId, label: 'Subject' },
    { Model: SchoolClass, id: req.body.classId, label: 'Class' },
  ]);
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
  })
    .filter()
    .sort()
    .limitFields()
    .paginate();

  if (req.query.page) {
    const subjectClassCount = await SubjectClass.countDocuments(
      features.filterQuery,
    );
    if (subjectClassCount > 0 && features.skip >= subjectClassCount) {
      throw new AppError('This page does not exist', 404);
    }
  }

  const allSubjectClasses = await features.query;
  res.status(200).json({
    status: 'success',
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
  await validateReferences([
    { Model: Subject, id: req.body.subjectId, label: 'Subject' },
    { Model: SchoolClass, id: req.body.classId, label: 'Class' },
  ]);
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
  const subjectClass = await SubjectClass.findById(req.params.id);
  if (!subjectClass) {
    return next(new AppError('No subject-class link found with that ID', 404));
  }

  const hasAssignments = await TeacherSubject.exists({
    subjectClassId: subjectClass._id,
  });
  if (hasAssignments) {
    return next(
      new AppError(
        'Cannot delete this subject-class link because teacher-subject assignments reference it',
        409,
      ),
    );
  }

  await SubjectClass.findByIdAndDelete(subjectClass._id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
