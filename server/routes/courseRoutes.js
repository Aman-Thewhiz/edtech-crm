import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import {
  createCourseController,
  deleteCourseController,
  getCourse,
  getCourseCategoriesController,
  getCourses,
  updateCourseController,
} from '../controllers/courseController.js';

const router = Router();

router.get('/', requireAuth, requirePermission('read', 'courses'), getCourses);
router.get('/categories', requireAuth, requirePermission('read', 'courses'), getCourseCategoriesController);
router.get('/:id', requireAuth, requirePermission('read', 'courses'), getCourse);
router.post('/', requireAuth, requirePermission('create', 'courses'), createCourseController);
router.put('/:id', requireAuth, requirePermission('update', 'courses'), updateCourseController);
router.delete('/:id', requireAuth, requirePermission('delete', 'courses'), deleteCourseController);

export default router;