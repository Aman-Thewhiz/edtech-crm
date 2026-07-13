export function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    error: error.message || 'Internal Server Error',
    details: error.details || [],
  });
}