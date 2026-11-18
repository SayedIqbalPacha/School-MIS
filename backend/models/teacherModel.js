const mongoose = require('mongoose');
const validator = require('validator');
const checks = require('./schemaValidators');

const teacherSchema = new mongoose.Schema(
  {
    teacherName: {
      type: String,
      required: [true, 'Teacher must have a first name'],
      trim: true,
      maxlength: [50, 'Teacher name cannot exceed 50 characters'],
    },
    teacherLast: {
      type: String,
      required: [true, 'Teacher must have a last name'],
      trim: true,
      maxlength: [50, 'Teacher last name cannot exceed 50 characters'],
    },
    teacherGender: {
      type: String,
      required: [true, 'Teacher gender is required'],
      enum: ['male', 'female', 'other'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Teacher date of birth is required'],
      validate: {
        validator: checks.isNonFutureDate,
        message: 'Date of birth cannot be in the future',
      },
    },
    email: {
      type: String,
      required: [true, 'Teacher email is required'],
      trim: true,
      lowercase: true,
      maxlength: [100, 'Email cannot exceed 100 characters'],
      unique: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'Phone cannot exceed 20 characters'],
    },
    salary: {
      type: mongoose.Schema.Types.Decimal128,
      required: [true, 'Teacher salary is required'],
      validate: {
        validator: checks.isNonNegativeDecimal,
        message: 'Salary must be zero or greater',
      },
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, collection: 'teacher' },
);

// Keep former teachers in the database for historical records, but exclude
// inactive teachers from regular reads. Managers can opt in when updating.
teacherSchema.pre(
  'findOneAndDelete',
  checks.preventDeletionWhenReferenced(
    [
      {
        modelName: 'TeacherSubject',
        field: 'teacherId',
        label: 'teacher-subject assignments',
      },
    ],
    'teacher',
  ),
);
teacherSchema.pre(
  'findOneAndUpdate',
  checks.preventDeactivationWhenReferenced(
    [
      {
        modelName: 'TeacherSubject',
        field: 'teacherId',
        label: 'teacher-subject assignments',
      },
    ],
    'teacher',
  ),
);

teacherSchema.pre(/^(find|countDocuments)/, function (next) {
  const options = this.getOptions();
  const { includeInactive } = options;
  delete options.includeInactive;

  if (!includeInactive) {
    this.where({ active: { $ne: false } });
  }
  next();
});

module.exports = mongoose.model('Teacher', teacherSchema);
