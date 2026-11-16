const mongoose = require('mongoose');
const Student = require('./studentModel');
const Exam = require('./examModel');
const ClassAcademicYear = require('./classAcademicYearModel');
const TeacherSubject = require('./teacherSubjectModel');
const StudentClass = require('./studentClassModel');

const examMarkSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Exam mark must reference a student'],
      validate: {
        validator: async (id) => Boolean(await Student.exists({ _id: id })),
        message: 'The selected student does not exist or is inactive',
      },
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: [true, 'Exam mark must reference an exam'],
      validate: {
        validator: async (id) => Boolean(await Exam.exists({ _id: id })),
        message: 'The selected exam does not exist',
      },
    },
    classAcademicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClassAcademicYear',
      required: [true, 'Exam mark must reference a class academic year'],
      validate: {
        validator: async (id) =>
          Boolean(await ClassAcademicYear.exists({ _id: id })),
        message: 'The selected class academic year does not exist',
      },
    },
    teacherSubjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeacherSubject',
      required: [true, 'Exam mark must reference a teacher-subject assignment'],
      validate: {
        validator: async (id) =>
          Boolean(await TeacherSubject.exists({ _id: id })),
        message: 'The selected teacher-subject assignment does not exist',
      },
    },
    marks: {
      type: Number,
      required: [true, 'Marks are required'],
      min: [0, 'Marks cannot be less than 0'],
      max: [100, 'Marks cannot exceed 100'],
    },
  },
  { timestamps: true, collection: 'exam_marks' },
);

const validateExamMarkRelations = async (examMark) => {
  const { studentId, examId, classAcademicId, teacherSubjectId } = examMark;
  if (!studentId || !examId || !classAcademicId || !teacherSubjectId) return;

  const [enrollment, exam, classAcademicYear, teacherSubject] =
    await Promise.all([
      StudentClass.exists({ studentId, classAcademicId }),
      Exam.findById(examId),
      ClassAcademicYear.findById(classAcademicId),
      TeacherSubject.findById(teacherSubjectId),
    ]);

  if (!enrollment) {
    const validationError = new mongoose.Error.ValidationError();
    validationError.addError(
      'studentId',
      new mongoose.Error.ValidatorError({
        path: 'studentId',
        message:
          'The student must be enrolled in this class academic year before receiving an exam mark',
      }),
    );
    throw validationError;
  }

  if (
    exam &&
    classAcademicYear &&
    !exam.academicYearId.equals(classAcademicYear.academicYearId)
  ) {
    const validationError = new mongoose.Error.ValidationError();
    validationError.addError(
      'classAcademicId',
      new mongoose.Error.ValidatorError({
        path: 'classAcademicId',
        message:
          'The exam and class academic year must belong to the same academic year',
      }),
    );
    throw validationError;
  }

  if (
    teacherSubject &&
    !teacherSubject.classAcademicId.equals(classAcademicId)
  ) {
    const validationError = new mongoose.Error.ValidationError();
    validationError.addError(
      'teacherSubjectId',
      new mongoose.Error.ValidatorError({
        path: 'teacherSubjectId',
        message:
          'The teacher-subject assignment must belong to this class academic year',
      }),
    );
    throw validationError;
  }
};

examMarkSchema.pre('validate', async function () {
  await validateExamMarkRelations(this);
});

examMarkSchema.pre('findOneAndUpdate', async function () {
  const currentExamMark = await this.model.findOne(this.getQuery());
  if (!currentExamMark) return;

  const update = this.getUpdate() || {};
  await validateExamMarkRelations({
    ...currentExamMark.toObject(),
    ...(update.$set || update),
  });
});

// Create a unique index to ensure that a student can have only one mark for a specific exam,
// class academic year, and teacher-subject assignment combination.
// how this works? it works like this if we try to insert a new document with the same combination of
//  studentId, examId, classAcademicId, and teacherSubjectId as an existing document, it will throw a duplicate key error and prevent the insertion.
examMarkSchema.index(
  { studentId: 1, examId: 1, classAcademicId: 1, teacherSubjectId: 1 },
  { unique: true },
);

module.exports = mongoose.model('ExamMark', examMarkSchema);
