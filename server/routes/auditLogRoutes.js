import express from 'express';
import * as auditLogController from '../controllers/auditLogController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = express.Router();

router.get('/', requireAuth, requireRole('admin', 'super_admin'), auditLogController.listAuditLogs);

export default router;
