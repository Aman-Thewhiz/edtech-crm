import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getStats } from '../controllers/dashboardController.js';

const router = Router();

router.get('/stats', requireAuth, getStats);

export default router;