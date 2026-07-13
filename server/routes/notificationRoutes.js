import { Router } from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// ============ NOTIFICATION ROUTES ============

router.get(
  '/',
  requireAuth,
  notificationController.getNotifications
);

router.get(
  '/:id',
  requireAuth,
  notificationController.getNotification
);

router.post(
  '/:id/mark-read',
  requireAuth,
  notificationController.markAsRead
);

router.post(
  '/mark-all-read',
  requireAuth,
  notificationController.markAllAsRead
);

router.delete(
  '/:id',
  requireAuth,
  notificationController.deleteNotification
);

router.delete(
  '/',
  requireAuth,
  notificationController.deleteAllNotifications
);

// ============ PREFERENCE ROUTES ============

router.get(
  '/preferences/me',
  requireAuth,
  notificationController.getPreference
);

router.put(
  '/preferences/me',
  requireAuth,
  notificationController.updatePreference
);

export default router;
