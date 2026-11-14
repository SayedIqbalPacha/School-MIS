const mongoose = require('mongoose');

const classAcademicYearSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SchoolClass',
      required: [true, 'Class academic year must reference a class'],
    },
    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: [true, 'Class academic year must reference an academic year'],
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

module.exports = mongoose.model('ClassAcademicYear', classAcademicYearSchema);
