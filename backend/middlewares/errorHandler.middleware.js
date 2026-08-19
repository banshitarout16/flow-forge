// Central error handler - keeps controllers thin, no try/catch clutter
export const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || res.statusCode !== 200 ? res.statusCode : 500;
  console.error(err.stack);
  res.status(statusCode || 500).json({
    message: err.message || "Server error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

// Wraps async controller functions so we don't repeat try/catch everywhere
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
