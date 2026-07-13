import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import {
  createStudentController,
  deleteStudentController,
  getStudent,
  getStudentIdCardController,
  getStudents,
  updateStudentController,
  updateStudentStatusController,
  uploadStudentDocumentController,
} from '../controllers/studentController.js';

const router = Router();

router.get('/', requireAuth, requirePermission('read', 'students'), getStudents);
router.post('/', requireAuth, requirePermission('create', 'students'), createStudentController);
router.get('/:id/id-card.pdf', requireAuth, requirePermission('read', 'students'), getStudentIdCardController);
router.post('/:id/documents', requireAuth, requirePermission('update', 'students'), uploadStudentDocumentController);
router.patch('/:id/status', requireAuth, requirePermission('update', 'students'), updateStudentStatusController);
router.get('/:id', requireAuth, requirePermission('read', 'students'), getStudent);
router.put('/:id', requireAuth, requirePermission('update', 'students'), updateStudentController);
router.delete('/:id', requireAuth, requirePermission('delete', 'students'), deleteStudentController);

export default router;
