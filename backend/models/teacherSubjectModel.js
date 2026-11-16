const mongoose = require('mongoose');
const Teacher = require('./teacherModel');
const SubjectClass = require('./subjectClassModel');
const ClassAcademicYear = require('./classAcademicYearModel');
const checks = require('./schemaValidators');

const teacherSubjectSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: [true, 'Teacher-subject link must reference a teacher'],
      validate: {
        validator: async (id) => Boolean(await Teacher.exists({ _id: id })),
        message: 'The selected teacher does not exist or is inactive',
      },
    },
    subjectClassId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubjectClass',
      required: [
        true,
        'Teacher-subject link must reference a subject-class pair',
      ],
      validate: {
        validator: async (id) =>
          Boolean(await SubjectClass.exists({ _id: id })),
        message: 'The selected subject-class link does not exist',
      },
    },
    classAcademicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClassAcademicYear',
      required: [
        true,
        'Teacher-subject link must reference a class academic year',
      ],
      validate: {
        validator: async (id) =>
          Boolean(await ClassAcademicYear.exists({ _id: id })),
        message: 'The selected class academic year does not exist',
      },
    },
  },
  { timestamps: true, collection: 'teacher_subject' },
);

const validateAssignmentClass = async (assignment) => {
  if (!assignment.subjectClassId || !assignment.classAcademicId) return;

  const [subjectClass, classAcademicYear] = await Promise.all([
    SubjectClass.findById(assignment.subjectClassId),
    ClassAcademicYear.findById(assignment.classAcademicId),
  ]);

  if (
    subjectClass &&
    classAcademicYear &&
    !subjectClass.classId.equals(classAcademicYear.classId)
  ) {
    const validationError = new mongoose.Error.ValidationError();
    validationError.addError(
      'classAcademicId',
      new mongoose.Error.ValidatorError({
        path: 'classAcademicId',
        message:
          'The subject-class link and class academic year must belong to the same class',
      }),
    );
    throw validationError;
  }
};

teacherSubjectSchema.pre('validate', async function () {
  await validateAssignmentClass(this);
});

teacherSubjectSchema.pre('findOneAndUpdate', async function () {
  const currentAssignment = await this.model.findOne(this.getQuery());
  if (!currentAssignment) return;

  const update = this.getUpdate() || {};
  await validateAssignmentClass({
    ...currentAssignment.toObject(),
    ...(update.$set || update),
  });
});

// One teacher is assigned to a subject for each class and academic year.
teacherSubjectSchema.index(
  { subjectClassId: 1, classAcademicId: 1 },
  { unique: true },
);

teacherSubjectSchema.pre(
  'findOneAndDelete',
  checks.preventDeletionWhenReferenced(
    [{ modelName: 'ExamMark', field: 'teacherSubjectId', label: 'exam marks' }],
    'teacher-subject assignment',
  ),
);

module.exports = mongoose.model('TeacherSubject', teacherSubjectSchema);
