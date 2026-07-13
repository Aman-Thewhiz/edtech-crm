import { getDashboardStats } from '../services/dashboardService.js';

export async function getStats(req, res, next) {
  try {
    const stats = await getDashboardStats(req.user);
    return res.json({ success: true, data: stats, message: 'Dashboard stats loaded' });
  } catch (error) {
    return next(error);
  }
}