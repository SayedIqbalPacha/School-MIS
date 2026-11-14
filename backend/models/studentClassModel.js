const mongoose = require('mongoose');

const studentClassSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student-class link must reference a student'],
    },
    classAcademicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClassAcademicYear',
      required: [
        true,
        'Student-class link must reference a class academic year',
      ],
    },
  },
  { timestamps: true, collection: 'student_class' },
);

studentClassSchema.index(
  { studentId: 1, classAcademicId: 1 },
  { unique: true },
);

module.exports = mongoose.model('StudentClass', studentClassSchema);
