import { permissionMap } from '../config/permissions.js';

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    return next();
  };
}

export function requirePermission(action, resource) {
  return (req, res, next) => {
    const permissions = permissionMap[req.user?.role] || [];
    const allowed = permissions.includes('*') || permissions.includes(`${resource}:*`) || permissions.includes(`${resource}:${action}`);
    if (!allowed) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    return next();
  };
}