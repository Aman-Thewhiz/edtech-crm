import { Router } from 'express';
import * as payrollController from '../controllers/payrollController.js';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';

const router = Router();

// ============ SALARY STRUCTURE ROUTES ============
router.post(
  '/salary-structures',
  requireAuth,
  requirePermission('payroll:create'),
  payrollController.createSalaryStructure
);

router.get(
  '/salary-structures',
  requireAuth,
  requirePermission('payroll:read'),
  payrollController.getSalaryStructures
);

router.get(
  '/salary-structures/:id',
  requireAuth,
  requirePermission('payroll:read'),
  payrollController.getSalaryStructure
);

router.put(
  '/salary-structures/:id',
  requireAuth,
  requirePermission('payroll:update'),
  payrollController.updateSalaryStructure
);

router.delete(
  '/salary-structures/:id',
  requireAuth,
  requirePermission('payroll:delete'),
  payrollController.deleteSalaryStructure
);

// ============ PAYROLL ROUTES ============
router.post(
  '/employees/:employeeId/payroll',
  requireAuth,
  requirePermission('payroll:create'),
  payrollController.generatePayroll
);

router.get(
  '/payroll',
  requireAuth,
  requirePermission('payroll:read'),
  payrollController.getPayrolls
);

router.get(
  '/payroll/:id',
  requireAuth,
  requirePermission('payroll:read'),
  payrollController.getPayroll
);

router.post(
  '/payroll/:id/approve',
  requireAuth,
  requirePermission('payroll:approve'),
  payrollController.approvePayroll
);

router.post(
  '/payroll/:id/process',
  requireAuth,
  requirePermission('payroll:process'),
  payrollController.processPayroll
);

router.put(
  '/payroll/:id',
  requireAuth,
  requirePermission('payroll:update'),
  payrollController.updatePayroll
);

router.delete(
  '/payroll/:id',
  requireAuth,
  requirePermission('payroll:delete'),
  payrollController.deletePayroll
);

// ============ PAYSLIP ROUTES ============
router.post(
  '/payroll/:payrollId/payslip',
  requireAuth,
  requirePermission('payroll:read'),
  payrollController.createPayslip
);

router.get(
  '/payslips',
  requireAuth,
  requirePermission('payroll:read'),
  payrollController.getPayslips
);

router.get(
  '/payslips/:id',
  requireAuth,
  requirePermission('payroll:read'),
  payrollController.getPayslip
);

router.post(
  '/payslips/:id/mark-downloaded',
  requireAuth,
  requirePermission('payroll:read'),
  payrollController.markPayslipDownloaded
);

export default router;
