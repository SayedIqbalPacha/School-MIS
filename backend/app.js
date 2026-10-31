const express = require('express');

const app = express();
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorCon');
const subjectRot = require('./routes/subjectRot');

app.use(express.json());

app.use('/api/subjects', subjectRot);

// handling unhandled routes
//.all means consider all operation like get post delete ...
app.all('*', (req, res, next) => {
  next(new AppError(`cant find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
