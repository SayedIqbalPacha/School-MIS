const mongoose = require('mongoose');
const checks = require('./schemaValidators');
const AcademicYear = require('./academicYearModel');

const examSchema = new mongoose.Schema(
  {
    examName: {
      type: String,
      required: [true, 'Exam must have a name'],
      trim: true,
      maxlength: [100, 'Exam name cannot exceed 100 characters'],
    },
    examType: {
      type: String,
      required: [true, 'Exam type is required'],
      trim: true,
      maxlength: [50, 'Exam type cannot exceed 50 characters'],
    },
    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: [true, 'Exam must belong to an academic year'],
      index: true,
      validate: {
        validator: async (id) =>
          Boolean(await AcademicYear.exists({ _id: id })),
        message: 'The selected academic year does not exist',
      },
    },
    startDate: {
      type: Date,
      required: [true, 'Exam start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'Exam end date is required'],
      validate: {
        validator: checks.dateIsOnOrAfter('startDate'),
        message: 'Exam end date must be on or after its start date',
      },
    },
  },
  { timestamps: true, collection: 'exams' },
);

examSchema.pre(
  'findOneAndDelete',
  checks.preventDeletionWhenReferenced(
    [{ modelName: 'ExamMark', field: 'examId', label: 'exam marks' }],
    'exam',
  ),
);
examSchema.pre(
  'findOneAndUpdate',
  checks.validateDateOrderOnUpdate(
    'startDate',
    'endDate',
    'Exam end date must be on or after its start date',
  ),
);

module.exports = mongoose.model('Exam', examSchema);
