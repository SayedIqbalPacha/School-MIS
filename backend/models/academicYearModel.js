const mongoose = require('mongoose');
const checks = require('./schemaValidators');

const academicYearSchema = new mongoose.Schema(
  {
    academicYearName: {
      type: String,
      required: [true, 'Academic year must have a name'],
      trim: true,
      maxlength: [50, 'Academic year name cannot exceed 50 characters'],
      unique: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Academic year start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'Academic year end date is required'],
      validate: {
        validator: checks.dateIsOnOrAfter('startDate'),
        message: 'Academic year end date must be on or after its start date',
      },
    },
  },
  { timestamps: true, collection: 'academic_years' },
);

academicYearSchema.pre(
  'findOneAndDelete',
  checks.preventDeletionWhenReferenced(
    [
      { modelName: 'Exam', field: 'academicYearId', label: 'exams' },
      {
        modelName: 'ClassAcademicYear',
        field: 'academicYearId',
        label: 'class academic years',
      },
    ],
    'academic year',
  ),
);
academicYearSchema.pre(
  'findOneAndUpdate',
  checks.validateDateOrderOnUpdate(
    'startDate',
    'endDate',
    'Academic year end date must be on or after its start date',
  ),
);

module.exports = mongoose.model('AcademicYear', academicYearSchema);
