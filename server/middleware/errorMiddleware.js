export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    // Solo mostramos el "stack" (donde falló) si estamos en desarrollo
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
