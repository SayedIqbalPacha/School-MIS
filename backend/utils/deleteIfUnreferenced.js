const AppError = require('./appError');
const {
  Exam,
  ExamMark,
  StudentClass,
  SubjectClass,
  TeacherSubject,
  ClassAcademicYear,
} = require('../models');

const references = {
  Teacher: [[TeacherSubject, 'teacherId', 'teacher-subject assignments']],
  Student: [
    [StudentClass, 'studentId', 'student-class enrollments'],
    [ExamMark, 'studentId', 'exam marks'],
  ],
  SchoolClass: [
    [SubjectClass, 'classId', 'subject-class links'],
    [ClassAcademicYear, 'classId', 'class academic years'],
  ],
  AcademicYear: [
    [Exam, 'academicYearId', 'exams'],
    [ClassAcademicYear, 'academicYearId', 'class academic years'],
  ],
  Subject: [[SubjectClass, 'subjectId', 'subject-class links']],
  SubjectClass: [
    [TeacherSubject, 'subjectClassId', 'teacher-subject assignments'],
  ],
  ClassAcademicYear: [
    [StudentClass, 'classAcademicId', 'student-class enrollments'],
    [TeacherSubject, 'classAcademicId', 'teacher-subject assignments'],
    [ExamMark, 'classAcademicId', 'exam marks'],
  ],
  Exam: [[ExamMark, 'examId', 'exam marks']],
  TeacherSubject: [[ExamMark, 'teacherSubjectId', 'exam marks']],
};

// Refuse parent deletion while dependent records still point to it.
module.exports = async (modelName, Model, id, recordLabel) => {
  const isPerson = modelName === 'Teacher' || modelName === 'Student';
  const findQuery = Model.findById(id);
  if (isPerson) findQuery.setOptions({ includeInactive: true });

  const record = await findQuery;
  if (!record) {
    throw new AppError(`No ${recordLabel} found with that ID`, 404);
  }

  const dependentRecords = await Promise.all(
    (references[modelName] || []).map(
      async ([DependentModel, field, label]) => {
        const exists = await DependentModel.exists({ [field]: record._id });
        return exists ? label : null;
      },
    ),
  );
  const blockingReferences = dependentRecords.filter(Boolean);

  if (blockingReferences.length) {
    throw new AppError(
      `Cannot delete this ${recordLabel} because it is referenced by ${blockingReferences.join(', ')}`,
      409,
    );
  }

  const deleteQuery = Model.findByIdAndDelete(record._id);
  if (isPerson) deleteQuery.setOptions({ includeInactive: true });
  await deleteQuery;
  return record;
};
