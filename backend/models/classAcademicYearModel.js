const mongoose = require('mongoose');
const checks = require('./schemaValidators');
const SchoolClass = require('./classModel');
const AcademicYear = require('./academicYearModel');

const classAcademicYearSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SchoolClass',
      required: [true, 'Class academic year must reference a class'],
      validate: {
        validator: async (id) => Boolean(await SchoolClass.exists({ _id: id })),
        message: 'The selected class does not exist',
      },
    },
    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: [true, 'Class academic year must reference an academic year'],
      validate: {
        validator: async (id) =>
          Boolean(await AcademicYear.exists({ _id: id })),
        message: 'The selected academic year does not exist',
      },
    },
    classAcademicName: {
      type: String,
      required: [true, 'Class academic year must have a name'],
      trim: true,
      maxlength: [50, 'Class academic year name cannot exceed 50 characters'],
    },
  },
  { timestamps: true, collection: 'class_academic_years' },
);

classAcademicYearSchema.index(
  { classId: 1, academicYearId: 1 },
  { unique: true },
);

classAcademicYearSchema.pre(
  'findOneAndDelete',
  checks.preventDeletionWhenReferenced(
    [
      {
        modelName: 'StudentClass',
        field: 'classAcademicId',
        label: 'student-class enrollments',
      },
      {
        modelName: 'TeacherSubject',
        field: 'classAcademicId',
        label: 'teacher-subject assignments',
      },
      { modelName: 'ExamMark', field: 'classAcademicId', label: 'exam marks' },
    ],
    'class academic year',
  ),
);

module.exports = mongoose.model('ClassAcademicYear', classAcademicYearSchema);
