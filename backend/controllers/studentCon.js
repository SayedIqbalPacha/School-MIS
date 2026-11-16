const Student = require('../models/studentModel');
const AppError = require('../utils/appError');
const CatchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const StudentClass = require('../models/studentClassModel');
const ExamMark = require('../models/examMarkModel');

exports.createStudent = CatchAsync(async (req, res) => {
  const newStudent = await Student.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { newStudent },
  });
});

exports.getAllStudents = CatchAsync(async (req, res) => {
  const features = new APIFeatures(Student.find(), req.query, {
    defaultSort: 'firstName',
    defaultFields: '-updatedAt',
  })
    .filter()
    .sort()
    .limitFields()
    .paginate();

  if (req.query.page) {
    const studentCount = await Student.countDocuments(features.filterQuery);
    if (studentCount > 0 && features.skip >= studentCount) {
      throw new AppError('This page does not exist', 404);
    }
  }

  const allStudents = await features.query;
  res.status(200).json({ status: 'success', data: { allStudents } });
});

exports.getOneStudent = CatchAsync(async (req, res, next) => {
  const oneStudent = await Student.findById(req.params.id);
  if (!oneStudent) {
    return next(new AppError('No student found with that ID', 404));
  }

  res.status(200).json({ status: 'success', data: { oneStudent } });
});

exports.updateStudent = CatchAsync(async (req, res, next) => {
  const updatedStudent = await Student.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true },
  ).setOptions({ includeInactive: true });
  if (!updatedStudent) {
    return next(new AppError('No student found with that ID', 404));
  }

  res.status(200).json({ status: 'success', data: { updatedStudent } });
});

exports.deleteStudent = CatchAsync(async (req, res, next) => {
  const student = await Student.findById(req.params.id).setOptions({
    includeInactive: true,
  });
  if (!student) return next(new AppError('No student found with that ID', 404));

  const [hasEnrollments, hasExamMarks] = await Promise.all([
    StudentClass.exists({ studentId: student._id }),
    ExamMark.exists({ studentId: student._id }),
  ]);
  if (hasEnrollments || hasExamMarks) {
    const references = [];
    if (hasEnrollments) references.push('student-class enrollments');
    if (hasExamMarks) references.push('exam marks');

    return next(
      new AppError(
        `Cannot delete this student because ${references.join(' and ')} reference it`,
        409,
      ),
    );
  }

  await Student.findByIdAndDelete(student._id).setOptions({
    includeInactive: true,
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
