const express = require("express");
const subjectCon = require("../controllers/subjectCon");

const router = express.Router();

router.post("/", subjectCon.createSubject);

router.get("/", subjectCon.getAllSubjects);

router.get("/:id", subjectCon.getOneSubject);

router.patch("/:id", subjectCon.updateSubject);

router.delete("/:id", subjectCon.deleteSubject);

router.get("/:subjectStats", subjectCon.getSubjectStats);
module.exports = router;
