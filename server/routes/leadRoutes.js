import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission, requireRole } from '../middleware/rbac.js';
import {
  addActivityController,
  assignLeadController,
  bulkUpdateController,
  createLeadController,
  deleteLeadController,
  exportController,
  getLead,
  getLeads,
  updateLeadController,
  updateStatusController,
} from '../controllers/leadController.js';

const router = Router();

router.get('/', requireAuth, requirePermission('read', 'leads'), getLeads);
router.get('/export', requireAuth, requirePermission('read', 'leads'), exportController);
router.post('/bulk', requireAuth, requirePermission('update', 'leads'), bulkUpdateController);
router.get('/:id', requireAuth, requirePermission('read', 'leads'), getLead);
router.post('/', requireAuth, requirePermission('create', 'leads'), createLeadController);
router.put('/:id', requireAuth, requirePermission('update', 'leads'), updateLeadController);
router.delete('/:id', requireAuth, requirePermission('delete', 'leads'), deleteLeadController);
router.patch('/:id/status', requireAuth, requirePermission('update', 'leads'), updateStatusController);
router.patch('/:id/assign', requireAuth, requirePermission('update', 'leads'), assignLeadController);
router.post('/:id/activities', requireAuth, requireRole('counsellor', 'admin', 'super_admin', 'sales_manager'), addActivityController);

export default router;