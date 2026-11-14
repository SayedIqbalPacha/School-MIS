const mongoose = require('mongoose');
const validator = require('validator');
const checks = require('./schemaValidators');

const studentSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Student must have a first name'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Student must have a last name'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    gender: {
      type: String,
      required: [true, 'Student gender is required'],
      enum: ['male', 'female', 'other'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Student date of birth is required'],
      validate: {
        validator: checks.isNonFutureDate,
        message: 'Date of birth cannot be in the future',
      },
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [100, 'Email cannot exceed 100 characters'],
      sparse: true,
      unique: true,
      validate: {
        validator: (value) => !value || validator.isEmail(value),
        message: 'Please provide a valid email',
      },
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'Phone cannot exceed 20 characters'],
    },
    enrollmentDate: {
      type: Date,
      required: [true, 'Enrollment date is required'],
      default: Date.now,
    },
    parentName: {
      type: String,
      trim: true,
      maxlength: [100, 'Parent name cannot exceed 100 characters'],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, collection: 'students' },
);

// Keep former students for academic history, but hide them from regular reads.
studentSchema.pre(/^(find|countDocuments)/, function (next) {
  const options = this.getOptions();
  const { includeInactive } = options;
  delete options.includeInactive;

  if (!includeInactive) {
    this.where({ active: { $ne: false } });
  }
  next();
});

module.exports = mongoose.model('Student', studentSchema);
