const ClassAcademicYear = require('../models/classAcademicYearModel');
const AppError = require('../utils/appError');
const CatchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const StudentClass = require('../models/studentClassModel');
const TeacherSubject = require('../models/teacherSubjectModel');
const ExamMark = require('../models/examMarkModel');

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
  const classAcademicYear = await ClassAcademicYear.findById(req.params.id);
  if (!classAcademicYear) {
    return next(new AppError('No class academic year found with that ID', 404));
  }

  const [hasEnrollments, hasAssignments, hasExamMarks] = await Promise.all([
    StudentClass.exists({ classAcademicId: classAcademicYear._id }),
    TeacherSubject.exists({ classAcademicId: classAcademicYear._id }),
    ExamMark.exists({ classAcademicId: classAcademicYear._id }),
  ]);
  if (hasEnrollments || hasAssignments || hasExamMarks) {
    const references = [];
    if (hasEnrollments) references.push('student-class enrollments');
    if (hasAssignments) references.push('teacher-subject assignments');
    if (hasExamMarks) references.push('exam marks');

    return next(
      new AppError(
        `Cannot delete this class academic year because ${references.join(' and ')} reference it`,
        409,
      ),
    );
  }

  await ClassAcademicYear.findByIdAndDelete(classAcademicYear._id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
