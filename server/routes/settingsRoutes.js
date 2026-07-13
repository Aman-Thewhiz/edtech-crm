import express from 'express';
import * as settingsController from '../controllers/settingsController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = express.Router();

router.get('/', requireAuth, settingsController.getSettings);
router.put('/', requireAuth, requireRole('admin', 'super_admin'), settingsController.updateSettings);

export default router;
