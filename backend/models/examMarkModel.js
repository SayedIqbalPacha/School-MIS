const mongoose = require('mongoose');

const examMarkSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Exam mark must reference a student'],
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: [true, 'Exam mark must reference an exam'],
    },
    classAcademicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClassAcademicYear',
      required: [true, 'Exam mark must reference a class academic year'],
    },
    teacherSubjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeacherSubject',
      required: [true, 'Exam mark must reference a teacher-subject assignment'],
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

// Create a unique index to ensure that a student can have only one mark for a specific exam,
// class academic year, and teacher-subject assignment combination.
// how this works? it works like this if we try to insert a new document with the same combination of
//  studentId, examId, classAcademicId, and teacherSubjectId as an existing document, it will throw a duplicate key error and prevent the insertion.
examMarkSchema.index(
  { studentId: 1, examId: 1, classAcademicId: 1, teacherSubjectId: 1 },
  { unique: true },
);

module.exports = mongoose.model('ExamMark', examMarkSchema);
