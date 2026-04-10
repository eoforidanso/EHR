export function errorHandler(err, req, res, _next) {
  console.error('Error:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }

  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    error: status === 500 ? 'Internal server error' : err.message,
  });
}
