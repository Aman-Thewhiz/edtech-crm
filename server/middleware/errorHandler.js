export function errorHandler(error, _req, res, _next) {
  console.error("\n========== SERVER ERROR ==========");
  console.error("Message:", error.message);
  console.error("Name:", error.name);

  if (error.stack) {
    console.error("Stack:");
    console.error(error.stack);
  }

  console.error("=================================\n");

  const statusCode = error.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    error: error.message || "Internal Server Error",
    details: error.details || [],
  });
}
