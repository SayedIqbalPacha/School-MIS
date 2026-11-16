const mongoose = require('mongoose');
const checks = require('./schemaValidators');

const classSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: [true, 'Class must have a name'],
      trim: true,
      maxlength: [100, 'Class name cannot exceed 100 characters'],
    },
    classCapacity: {
      type: Number,
      required: [true, 'Class capacity is required'],
      min: [1, 'Class capacity must be at least 1'],
      validate: {
        validator: checks.isInteger,
        message: 'Class capacity must be a whole number',
      },
    },
    classStartDate: {
      type: Date,
      required: [true, 'Class start date is required'],
    },
    classEndDate: {
      type: Date,
      required: [true, 'Class end date is required'],
      validate: {
        validator: checks.dateIsOnOrAfter('classStartDate'),
        message: 'Class end date must be on or after its start date',
      },
    },
    classShift: {
      type: String,
      required: [true, 'Class shift is required'],
      trim: true,
      maxlength: [20, 'Class shift cannot exceed 20 characters'],
    },
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      trim: true,
      maxlength: [20, 'Room number cannot exceed 20 characters'],
    },
  },
  { timestamps: true, collection: 'classes' },
);

classSchema.index({ className: 1 });

classSchema.pre(
  'findOneAndDelete',
  checks.preventDeletionWhenReferenced(
    [
      {
        modelName: 'SubjectClass',
        field: 'classId',
        label: 'subject-class links',
      },
      {
        modelName: 'ClassAcademicYear',
        field: 'classId',
        label: 'class academic years',
      },
    ],
    'class',
  ),
);
classSchema.pre(
  'findOneAndUpdate',
  checks.validateDateOrderOnUpdate(
    'classStartDate',
    'classEndDate',
    'Class end date must be on or after its start date',
  ),
);

module.exports = mongoose.model('SchoolClass', classSchema);
