import { Router } from "express";
import * as leaveController from "../controllers/leaveController.js";
import { requireAuth } from "../middleware/auth.js";
import { requirePermission } from "../middleware/rbac.js";

const router = Router();

// ============ LEAVE POLICY ROUTES ============
router.post(
  "/policies",
  requireAuth,
  requirePermission("leave:create"),
  leaveController.createLeavePolicy
);

router.get(
  "/policies",
  requireAuth,
  requirePermission("leave:read"),
  leaveController.getLeavePolicies
);

router.get(
  "/policies/:id",
  requireAuth,
  requirePermission("leave:read"),
  leaveController.getLeavePolicy
);

router.put(
  "/policies/:id",
  requireAuth,
  requirePermission("leave:update"),
  leaveController.updateLeavePolicy
);

router.delete(
  "/policies/:id",
  requireAuth,
  requirePermission("leave:delete"),
  leaveController.deleteLeavePolicy
);

// ============ LEAVE REQUEST ROUTES ============
router.post(
  "/requests",
  requireAuth,
  requirePermission("leave:create"),
  leaveController.createLeaveRequest
);

router.get(
  "/requests",
  requireAuth,
  requirePermission("leave:read"),
  leaveController.getLeaveRequests
);

router.get(
  "/requests/:id",
  requireAuth,
  requirePermission("leave:read"),
  leaveController.getLeaveRequest
);

router.post(
  "/requests/:id/approve",
  requireAuth,
  requirePermission("leave:approve"),
  leaveController.approveLeaveRequest
);

router.post(
  "/requests/:id/cancel",
  requireAuth,
  requirePermission("leave:cancel"),
  leaveController.cancelLeaveRequest
);

// ============ LEAVE BALANCE ROUTES ============
router.post(
  "/balances",
  requireAuth,
  requirePermission("leave:create"),
  leaveController.createLeaveBalance
);

router.get(
  "/balances",
  requireAuth,
  requirePermission("leave:read"),
  leaveController.getLeaveBalances
);

router.get(
  "/balances/employee/:employeeId",
  requireAuth,
  requirePermission("leave:read"),
  leaveController.getEmployeeLeaveBalances
);

router.get(
  "/balances/employee/:employeeId/policy/:policyId",
  requireAuth,
  requirePermission("leave:read"),
  leaveController.getLeaveBalance
);

router.put(
  "/balances/:id",
  requireAuth,
  requirePermission("leave:update"),
  leaveController.updateLeaveBalance
);

export default router;
