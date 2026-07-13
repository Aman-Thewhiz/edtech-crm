import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import {
  createAdmissionController,
  deleteAdmissionController,
  getAdmission,
  getAdmissions,
  updateAdmissionChecklistController,
  updateAdmissionController,
  updateAdmissionStatusController,
} from '../controllers/admissionController.js';

const router = Router();

router.get('/', requireAuth, requirePermission('read', 'admissions'), getAdmissions);
router.post('/', requireAuth, requirePermission('create', 'admissions'), createAdmissionController);
router.patch('/:id/status', requireAuth, requirePermission('update', 'admissions'), updateAdmissionStatusController);
router.patch('/:id/checklist', requireAuth, requirePermission('update', 'admissions'), updateAdmissionChecklistController);
router.get('/:id', requireAuth, requirePermission('read', 'admissions'), getAdmission);
router.put('/:id', requireAuth, requirePermission('update', 'admissions'), updateAdmissionController);
router.delete('/:id', requireAuth, requirePermission('delete', 'admissions'), deleteAdmissionController);

export default router;
