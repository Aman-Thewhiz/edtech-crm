import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import {
  createBatchController,
  deleteBatchController,
  getBatch,
  getBatches,
  updateBatchController,
  updateBatchStatusController,
} from '../controllers/courseController.js';

const router = Router();

router.get('/', requireAuth, requirePermission('read', 'courses'), getBatches);
router.get('/:id', requireAuth, requirePermission('read', 'courses'), getBatch);
router.post('/', requireAuth, requirePermission('create', 'courses'), createBatchController);
router.put('/:id', requireAuth, requirePermission('update', 'courses'), updateBatchController);
router.delete('/:id', requireAuth, requirePermission('delete', 'courses'), deleteBatchController);
router.patch('/:id/status', requireAuth, requirePermission('update', 'courses'), updateBatchStatusController);

export default router;