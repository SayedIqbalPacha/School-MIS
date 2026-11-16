const mongoose = require('mongoose');
const checks = require('./schemaValidators');
const Subject = require('./subjectModel');
const SchoolClass = require('./classModel');

const subjectClassSchema = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject-class link must reference a subject'],
      validate: {
        validator: async (id) => Boolean(await Subject.exists({ _id: id })),
        message: 'The selected subject does not exist',
      },
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SchoolClass',
      required: [true, 'Subject-class link must reference a class'],
      validate: {
        validator: async (id) => Boolean(await SchoolClass.exists({ _id: id })),
        message: 'The selected class does not exist',
      },
    },
  },
  { timestamps: true, collection: 'subject_class' },
);

subjectClassSchema.index({ subjectId: 1, classId: 1 }, { unique: true });

subjectClassSchema.pre(
  'findOneAndDelete',
  checks.preventDeletionWhenReferenced(
    [
      {
        modelName: 'TeacherSubject',
        field: 'subjectClassId',
        label: 'teacher-subject assignments',
      },
    ],
    'subject-class link',
  ),
);

module.exports = mongoose.model('SubjectClass', subjectClassSchema);
