const AppError = require('../utils/AppError');

function notFound(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND'));
}

function errorHandler(err, req, res, next) {
  let status = err.statusCode || 500;
  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'Internal server error';
  let details = err.details;

  if (err.name === 'ValidationError') {
    status = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = Object.values(err.errors || {}).map((e) => e.message);
  } else if (err.code === 11000) {
    status = 409;
    code = 'DUPLICATE';
    message = 'Duplicate key';
    details = err.keyValue;
  } else if (err.name === 'JsonWebTokenError') {
    status = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    status = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Authentication token expired';
  }

  if (status >= 500 && process.env.NODE_ENV !== 'production') {
    console.error('[error]', err);
  }

  res.status(status).json({
    success: false,
    error: {
      message: status >= 500 && process.env.NODE_ENV === 'production' ? 'Internal server error' : message,
      code,
      ...(details !== undefined ? { details } : {}),
    },
  });
}

module.exports = { notFound, errorHandler };
