const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();
// Register every Mongoose model so string refs are available to populate().
require('./models');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorCon');
const userRot = require('./routes/userRot');
const subjectRot = require('./routes/subjectRot');
const teacherRot = require('./routes/teacherRot');
const studentRot = require('./routes/studentRot');
const classRot = require('./routes/classRot');
const examRot = require('./routes/examRot');
const academicYearRot = require('./routes/academicYearRot');
const subjectClassRot = require('./routes/subjectClassRot');
const studentClassRot = require('./routes/studentClassRot');
const teacherSubjectRot = require('./routes/teacherSubjectRot');
const classAcademicYearRot = require('./routes/classAcademicYearRot');
const examMarkRot = require('./routes/examMarkRot');

// reading data from body into req.body
app.use(express.json());
app.use(cookieParser());

// Allow the React app to send and receive the authentication cookie.
// Set CLIENT_URL in config.env when the frontend is hosted on another origin.
const getAllowedOrigins = () => {
  const configuredOrigins = (process.env.CLIENT_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (process.env.NODE_ENV !== 'production') {
    configuredOrigins.push(
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    );
  }

  return configuredOrigins;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || getAllowedOrigins().includes(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
  }),
);

// Reject cross-origin browser requests that can change data. CORS alone does
// not prevent a browser from sending a forged request with a user's cookie.
app.use((req, res, next) => {
  const changesData = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  const origin = req.get('origin');

  if (!changesData || !origin) return next();

  const sameOrigin = `${req.protocol}://${req.get('host')}`;
  if (origin === sameOrigin || getAllowedOrigins().includes(origin)) {
    return next();
  }

  return next(new AppError('Request origin is not allowed.', 403));
});

// GLOBAL MIDDLEWAREs

//Set security for http headers
app.use(helmet());

// Limit the number of requests from one API
const limiter = rateLimit({
  // is maximum number of req from one ip in one hour
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP , please try again in an hour',
});
// it mean apply this rate limiting constraint on app urls that start with (api) keyword
app.use('/api', limiter);

// Data sanitization against no sql query injection like:{email:{$gt:""}}
app.use(mongoSanitize());

// Data sanitization against xss
app.use(xss());

// Prevent parameter pollution it generally prevent some dublicate parameter values
app.use(hpp());

app.use('/api/subjects', subjectRot);
app.use('/api/users', userRot);
app.use('/api/teachers', teacherRot);
app.use('/api/students', studentRot);
app.use('/api/classes', classRot);
app.use('/api/exams', examRot);
app.use('/api/academic-years', academicYearRot);
app.use('/api/subject-classes', subjectClassRot);
app.use('/api/student-classes', studentClassRot);
app.use('/api/teacher-subjects', teacherSubjectRot);
app.use('/api/class-academic-years', classAcademicYearRot);
app.use('/api/exam-marks', examMarkRot);

// handling unhandled routes
//.all means consider all operation like get post delete ...
app.all('*', (req, res, next) => {
  next(new AppError(`cant find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
