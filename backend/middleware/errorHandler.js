/**
 * Error handling middleware
 * Catches and formats all errors in a consistent way
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
};

module.exports = errorHandler;
