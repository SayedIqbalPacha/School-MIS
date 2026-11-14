const express = require('express');
const subjectCon = require('../controllers/subjectCon');
const authCon = require('../controllers/authCon');
const router = express.Router();

router.post('/', subjectCon.createSubject);

router.get('/', authCon.protect, subjectCon.getAllSubjects);

router.get('/stats', subjectCon.getSubjectStats);

router.get('/:id', authCon.protect, subjectCon.getOneSubject);

router.patch('/:id', subjectCon.updateSubject);

router.delete('/:id', subjectCon.deleteSubject);

module.exports = router;
