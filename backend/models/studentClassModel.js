const mongoose = require('mongoose');
const Student = require('./studentModel');
const ClassAcademicYear = require('./classAcademicYearModel');

const studentClassSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student-class link must reference a student'],
      validate: {
        validator: async (id) => Boolean(await Student.exists({ _id: id })),
        message: 'The selected student does not exist or is inactive',
      },
    },
    classAcademicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClassAcademicYear',
      required: [
        true,
        'Student-class link must reference a class academic year',
      ],
      validate: {
        validator: async (id) =>
          Boolean(await ClassAcademicYear.exists({ _id: id })),
        message: 'The selected class academic year does not exist',
      },
    },
  },
  { timestamps: true, collection: 'student_class' },
);

studentClassSchema.index(
  { studentId: 1, classAcademicId: 1 },
  { unique: true },
);

module.exports = mongoose.model('StudentClass', studentClassSchema);
