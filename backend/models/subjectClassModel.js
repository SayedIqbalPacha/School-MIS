const mongoose = require('mongoose');

const subjectClassSchema = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject-class link must reference a subject'],
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SchoolClass',
      required: [true, 'Subject-class link must reference a class'],
    },
  },
  { timestamps: true, collection: 'subject_class' },
);

subjectClassSchema.index({ subjectId: 1, classId: 1 }, { unique: true });

module.exports = mongoose.model('SubjectClass', subjectClassSchema);
