// when we pass four arguments to a function the express will got that as the error handler middleware
// so this is a global error handler
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "an error occured";

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
