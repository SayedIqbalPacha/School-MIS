const express = require("express");
const app = express();

const subjectRot = require("./routes/subjectRot");

app.use(express.json());

app.use("/api/subjects", subjectRot);

module.exports = app;
