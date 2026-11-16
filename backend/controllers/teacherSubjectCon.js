const TeacherSubject = require('../models/teacherSubjectModel');
const AppError = require('../utils/appError');
const CatchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const ExamMark = require('../models/examMarkModel');
const Teacher = require('../models/teacherModel');
const SubjectClass = require('../models/subjectClassModel');
const ClassAcademicYear = require('../models/classAcademicYearModel');
const validateReferences = require('../utils/validateReferences');

exports.createTeacherSubject = CatchAsync(async (req, res) => {
  await validateReferences([
    { Model: Teacher, id: req.body.teacherId, label: 'Teacher' },
    {
      Model: SubjectClass,
      id: req.body.subjectClassId,
      label: 'Subject-class link',
    },
    {
      Model: ClassAcademicYear,
      id: req.body.classAcademicId,
      label: 'Class academic year',
    },
  ]);
  const newTeacherSubject = await TeacherSubject.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { newTeacherSubject },
  });
});

exports.getAllTeacherSubjects = CatchAsync(async (req, res) => {
  const features = new APIFeatures(TeacherSubject.find(), req.query, {
    defaultSort: 'createdAt',
    defaultFields: '-updatedAt',
  })
    .filter()
    .sort()
    .limitFields()
    .paginate();

  if (req.query.page) {
    const teacherSubjectCount = await TeacherSubject.countDocuments(
      features.filterQuery,
    );
    if (teacherSubjectCount > 0 && features.skip >= teacherSubjectCount) {
      throw new AppError('This page does not exist', 404);
    }
  }

  const allTeacherSubjects = await features.query;
  res.status(200).json({
    status: 'success',
    data: { allTeacherSubjects },
  });
});

exports.getOneTeacherSubject = CatchAsync(async (req, res, next) => {
  const oneTeacherSubject = await TeacherSubject.findById(req.params.id);
  if (!oneTeacherSubject) {
    return next(
      new AppError('No teacher-subject assignment found with that ID', 404),
    );
  }

  res.status(200).json({ status: 'success', data: { oneTeacherSubject } });
});

exports.updateTeacherSubject = CatchAsync(async (req, res, next) => {
  await validateReferences([
    { Model: Teacher, id: req.body.teacherId, label: 'Teacher' },
    {
      Model: SubjectClass,
      id: req.body.subjectClassId,
      label: 'Subject-class link',
    },
    {
      Model: ClassAcademicYear,
      id: req.body.classAcademicId,
      label: 'Class academic year',
    },
  ]);
  const updatedTeacherSubject = await TeacherSubject.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true },
  );
  if (!updatedTeacherSubject) {
    return next(
      new AppError('No teacher-subject assignment found with that ID', 404),
    );
  }

  res.status(200).json({
    status: 'success',
    data: { updatedTeacherSubject },
  });
});

exports.deleteTeacherSubject = CatchAsync(async (req, res, next) => {
  const teacherSubject = await TeacherSubject.findById(req.params.id);
  if (!teacherSubject) {
    return next(
      new AppError('No teacher-subject assignment found with that ID', 404),
    );
  }

  const hasExamMarks = await ExamMark.exists({
    teacherSubjectId: teacherSubject._id,
  });
  if (hasExamMarks) {
    return next(
      new AppError(
        'Cannot delete this teacher-subject assignment because exam marks reference it',
        409,
      ),
    );
  }

  await TeacherSubject.findByIdAndDelete(teacherSubject._id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
