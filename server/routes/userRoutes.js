import express from 'express';
import * as userController from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = express.Router();

router.get('/', requireAuth, requireRole('admin', 'super_admin'), userController.listUsers);
router.patch('/:id', requireAuth, requireRole('admin', 'super_admin'), userController.updateUser);
router.delete('/:id', requireAuth, requireRole('admin', 'super_admin'), userController.deleteUser);

export default router;
