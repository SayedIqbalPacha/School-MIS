const mongoose = require('mongoose');

const teacherSubjectSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: [true, 'Teacher-subject link must reference a teacher'],
    },
    subjectClassId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubjectClass',
      required: [
        true,
        'Teacher-subject link must reference a subject-class pair',
      ],
    },
    classAcademicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClassAcademicYear',
      required: [
        true,
        'Teacher-subject link must reference a class academic year',
      ],
    },
  },
  { timestamps: true, collection: 'teacher_subject' },
);

// One teacher is assigned to a subject for each class and academic year.
teacherSubjectSchema.index(
  { subjectClassId: 1, classAcademicId: 1 },
  { unique: true },
);

module.exports = mongoose.model('TeacherSubject', teacherSubjectSchema);
