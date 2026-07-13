export function auditLog(req, _res, next) {
  if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method)) {
    req.auditEvent = {
      action: req.method,
      resource: req.originalUrl,
      metadata: { body: req.body },
    };
  }
  return next();
}