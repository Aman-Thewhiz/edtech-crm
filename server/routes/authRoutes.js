import { Router } from 'express';
import { auditLog } from '../middleware/auditLog.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { changePasswordController, forgotPassword, login, logout, me, refresh, register, resetPasswordController } from '../controllers/authController.js';

const router = Router();

router.post('/register', requireAuth, requireRole('super_admin', 'admin'), auditLog, register);
router.post('/login', auditLog, login);
router.post('/logout', requireAuth, auditLog, logout);
router.post('/refresh', refresh);
router.post('/forgot-password', auditLog, forgotPassword);
router.post('/reset-password', auditLog, resetPasswordController);
router.get('/me', requireAuth, me);
router.patch('/change-password', requireAuth, auditLog, changePasswordController);

export default router;