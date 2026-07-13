import * as leaveService from "../services/leaveService.js";

function envelope(res, data, message = "Success", statusCode = 200) {
  return res.status(statusCode).json({ success: true, data, message });
}

// ============ LEAVE POLICY ENDPOINTS ============

export async function createLeavePolicy(req, res, next) {
  try {
    const policy = await leaveService.createLeavePolicy(req.body);
    return envelope(res, { policy }, "Leave policy created", 201);
  } catch (error) {
    next(error);
  }
}

export async function getLeavePolicies(req, res, next) {
  try {
    const data = await leaveService.getLeavePolicies(req.query);
    return res.json({
      success: true,
      data: data.data,
      message: "Leave policies loaded",
      pagination: {
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getLeavePolicy(req, res, next) {
  try {
    const policy = await leaveService.getLeavePolicyById(req.params.id);
    return envelope(res, { policy }, "Leave policy loaded");
  } catch (error) {
    next(error);
  }
}

export async function updateLeavePolicy(req, res, next) {
  try {
    const policy = await leaveService.updateLeavePolicy(req.params.id, req.body);
    return envelope(res, { policy }, "Leave policy updated");
  } catch (error) {
    next(error);
  }
}

export async function deleteLeavePolicy(req, res, next) {
  try {
    const result = await leaveService.deleteLeavePolicy(req.params.id);
    return envelope(res, result, "Leave policy deleted");
  } catch (error) {
    next(error);
  }
}

// ============ LEAVE REQUEST ENDPOINTS ============

export async function createLeaveRequest(req, res, next) {
  try {
    const request = await leaveService.createLeaveRequest(req.body, req.user.sub);
    return envelope(res, { request }, "Leave request created", 201);
  } catch (error) {
    next(error);
  }
}

export async function getLeaveRequests(req, res, next) {
  try {
    const data = await leaveService.getLeaveRequests(req.query);
    return res.json({
      success: true,
      data: data.data,
      message: "Leave requests loaded",
      pagination: {
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getLeaveRequest(req, res, next) {
  try {
    const request = await leaveService.getLeaveRequestById(req.params.id);
    return envelope(res, { request }, "Leave request loaded");
  } catch (error) {
    next(error);
  }
}

export async function approveLeaveRequest(req, res, next) {
  try {
    const { approvalType } = req.body;
    if (!approvalType || !["manager", "hr"].includes(approvalType)) {
      return res.status(400).json({
        success: false,
        error: "Invalid approval type. Must be 'manager' or 'hr'.",
      });
    }

    const request = await leaveService.approveLeaveRequest(
      req.params.id,
      approvalType,
      req.body,
      req.user.sub
    );
    return envelope(res, { request }, "Leave request approved");
  } catch (error) {
    next(error);
  }
}

export async function cancelLeaveRequest(req, res, next) {
  try {
    const request = await leaveService.cancelLeaveRequest(req.params.id, req.body, req.user.sub);
    return envelope(res, { request }, "Leave request cancelled");
  } catch (error) {
    next(error);
  }
}

// ============ LEAVE BALANCE ENDPOINTS ============

export async function getLeaveBalances(req, res, next) {
  try {
    const data = await leaveService.getLeaveBalances(req.query);
    return res.json({
      success: true,
      data: data.data,
      message: "Leave balances loaded",
      pagination: {
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getEmployeeLeaveBalances(req, res, next) {
  try {
    const { employeeId } = req.params;
    const { financialYear } = req.query;

    if (!financialYear) {
      return res.status(400).json({
        success: false,
        error: "Financial year is required",
      });
    }

    const balances = await leaveService.getEmployeeLeaveBalances(employeeId, financialYear);
    return envelope(res, { balances }, "Employee leave balances loaded");
  } catch (error) {
    next(error);
  }
}

export async function getLeaveBalance(req, res, next) {
  try {
    const { employeeId, policyId } = req.params;
    const { financialYear } = req.query;

    if (!financialYear) {
      return res.status(400).json({
        success: false,
        error: "Financial year is required",
      });
    }

    const balance = await leaveService.getLeaveBalanceByEmployeeAndPolicy(
      employeeId,
      policyId,
      financialYear
    );
    return envelope(res, { balance }, "Leave balance loaded");
  } catch (error) {
    next(error);
  }
}

export async function createLeaveBalance(req, res, next) {
  try {
    const balance = await leaveService.createLeaveBalance(req.body);
    return envelope(res, { balance }, "Leave balance created", 201);
  } catch (error) {
    next(error);
  }
}

export async function updateLeaveBalance(req, res, next) {
  try {
    const balance = await leaveService.updateLeaveBalance(req.params.id, req.body);
    return envelope(res, { balance }, "Leave balance updated");
  } catch (error) {
    next(error);
  }
}
