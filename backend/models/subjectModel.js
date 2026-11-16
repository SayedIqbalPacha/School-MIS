const mongoose = require('mongoose');
const checks = require('./schemaValidators');

const subjectSchema = new mongoose.Schema(
  {
    subjectName: {
      type: String,
      required: [true, 'Subject must have a name'],
      trim: true,
      maxlength: [100, 'Subject name cannot exceed 100 characters'],
      unique: true,
    },
    creditHours: {
      type: Number,
      required: [true, 'Subject must have credit hours'],
      min: [1, 'Credit hours must be at least 1'],
      max: [16, 'Credit hours cannot exceed 16'],
      validate: {
        validator: checks.isInteger,
        message: 'Credit hours must be a whole number',
      },
    },
  },
  {
    timestamps: true,
    collection: 'subjects',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

subjectSchema.virtual('nameLength').get(function () {
  return this.subjectName.length;
});

subjectSchema.pre(
  'findOneAndDelete',
  checks.preventDeletionWhenReferenced(
    [
      {
        modelName: 'SubjectClass',
        field: 'subjectId',
        label: 'subject-class links',
      },
    ],
    'subject',
  ),
);

module.exports = mongoose.model('Subject', subjectSchema);
