const express = require('express');
const subjectCon = require('../controllers/subjectCon');

const router = express.Router();

router.post('/', subjectCon.createSubject);

router.get('/', subjectCon.getAllSubjects);

router.get('/stats', subjectCon.getSubjectStats);

router.get('/:id', subjectCon.getOneSubject);

router.patch('/:id', subjectCon.updateSubject);

router.delete('/:id', subjectCon.deleteSubject);

module.exports = router;
