import { Router } from 'express';
import * as reportsController from '../controllers/reportsController.js';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';

const router = Router();

// ============ REPORT ENDPOINTS ============

router.get(
  '/lead-conversion',
  requireAuth,
  requirePermission('reports:read'),
  reportsController.getLeadConversionReport
);

router.get(
  '/admissions-trend',
  requireAuth,
  requirePermission('reports:read'),
  reportsController.getAdmissionsTrendReport
);

router.get(
  '/revenue',
  requireAuth,
  requirePermission('reports:read'),
  reportsController.getRevenueReport
);

router.get(
  '/student-enrollment',
  requireAuth,
  requirePermission('reports:read'),
  reportsController.getStudentEnrollmentReport
);

router.get(
  '/employee-attendance',
  requireAuth,
  requirePermission('reports:read'),
  reportsController.getEmployeeAttendanceReport
);

router.get(
  '/payroll-summary',
  requireAuth,
  requirePermission('reports:read'),
  reportsController.getPayrollSummaryReport
);

// ============ EXPORT ENDPOINTS ============

router.get(
  '/lead-conversion/export',
  requireAuth,
  requirePermission('reports:read'),
  reportsController.exportLeadConversionReport
);

router.get(
  '/admissions-trend/export',
  requireAuth,
  requirePermission('reports:read'),
  reportsController.exportAdmissionsTrendReport
);

router.get(
  '/revenue/export',
  requireAuth,
  requirePermission('reports:read'),
  reportsController.exportRevenueReport
);

router.get(
  '/student-enrollment/export',
  requireAuth,
  requirePermission('reports:read'),
  reportsController.exportStudentEnrollmentReport
);

router.get(
  '/employee-attendance/export',
  requireAuth,
  requirePermission('reports:read'),
  reportsController.exportEmployeeAttendanceReport
);

router.get(
  '/payroll-summary/export',
  requireAuth,
  requirePermission('reports:read'),
  reportsController.exportPayrollSummaryReport
);

export default router;
