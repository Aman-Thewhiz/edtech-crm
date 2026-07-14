import LeavePolicy from "../models/LeavePolicy.js";
import LeaveRequest from "../models/LeaveRequest.js";
import LeaveBalance from "../models/LeaveBalance.js";
import Employee from "../models/Employee.js";
import Attendance from "../models/Attendance.js";
import {
  validateLeavePolicy,
  validateLeavePolicyUpdate,
  validateLeaveRequest,
  validateLeaveApproval,
} from "../validations/leaveValidation.js";
import { notifyLeaveStatusChange } from "./notificationService.js";



function mapLeavePolicy(policy) {
  return {
    _id: policy._id,
    leaveType: policy.leaveType,
    code: policy.code,
    description: policy.description,
    annualQuota: policy.annualQuota,
    carryForwardAllowed: policy.carryForwardAllowed,
    carryForwardLimit: policy.carryForwardLimit,
    minimumDaysPerRequest: policy.minimumDaysPerRequest,
    maxConsecutiveDays: policy.maxConsecutiveDays,
    requiresApproval: policy.requiresApproval,
    requiresHRApproval: policy.requiresHRApproval,
    isActive: policy.isActive,
    createdAt: policy.createdAt,
    updatedAt: policy.updatedAt,
  };
}

export async function createLeavePolicy(data) {
  const validation = validateLeavePolicy(data);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(", "));
  }

  const policy = await LeavePolicy.create(validation.data);
  return mapLeavePolicy(policy);
}

export async function getLeavePolicies(filters = {}) {
  const query = { isDeleted: false };

  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  }

  if (filters.search) {
    query.$or = [
      { leaveType: { $regex: filters.search, $options: "i" } },
      { code: { $regex: filters.search, $options: "i" } },
      { description: { $regex: filters.search, $options: "i" } },
    ];
  }

  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await LeavePolicy.countDocuments(query);
  const data = await LeavePolicy.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });

  return {
    data: data.map(mapLeavePolicy),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getLeavePolicyById(id) {
  const policy = await LeavePolicy.findById(id);
  if (!policy || policy.isDeleted) {
    throw new Error("Leave policy not found.");
  }
  return mapLeavePolicy(policy);
}

export async function updateLeavePolicy(id, data) {
  const validation = validateLeavePolicyUpdate(data);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(", "));
  }

  const policy = await LeavePolicy.findByIdAndUpdate(id, validation.data, { new: true });
  if (!policy || policy.isDeleted) {
    throw new Error("Leave policy not found.");
  }
  return mapLeavePolicy(policy);
}

export async function deleteLeavePolicy(id) {
  const policy = await LeavePolicy.findByIdAndUpdate(
    id,
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  );
  if (!policy) {
    throw new Error("Leave policy not found.");
  }
  return { message: "Leave policy deleted" };
}


function mapLeaveRequest(request) {
  return {
    _id: request._id,
    employee: request.employee,
    leavePolicy: request.leavePolicy,
    startDate: request.startDate,
    endDate: request.endDate,
    numberOfDays: request.numberOfDays,
    reason: request.reason,
    attachmentFileName: request.attachmentFileName,
    status: request.status,
    managerApproval: request.managerApproval,
    hrApproval: request.hrApproval,
    cancelledBy: request.cancelledBy,
    cancelledAt: request.cancelledAt,
    cancellationReason: request.cancellationReason,
    notes: request.notes,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  };
}

export async function createLeaveRequest(data, userId) {
  const validation = validateLeaveRequest(data);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(", "));
  }

  const { employee, leavePolicy, startDate, endDate, numberOfDays } = validation.data;

  const emp = await Employee.findById(employee);
  if (!emp || emp.isDeleted) {
    throw new Error("Employee not found.");
  }

  const policy = await LeavePolicy.findById(leavePolicy);
  if (!policy || policy.isDeleted || !policy.isActive) {
    throw new Error("Leave policy not found or inactive.");
  }

  const overlapping = await LeaveRequest.findOne({
    employee,
    status: { $in: ["applied", "pending", "approved"] },
    startDate: { $lte: new Date(endDate) },
    endDate: { $gte: new Date(startDate) },
    isDeleted: false,
  });

  if (overlapping) {
    throw new Error("Employee already has overlapping leave request.");
  }

  if (new Date(startDate) > new Date(endDate)) {
    throw new Error("Start date must be before end date.");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const leaveStart = new Date(startDate);
  leaveStart.setHours(0, 0, 0, 0);
  if (leaveStart < today) {
    throw new Error("Cannot apply for leave in the past.");
  }

  const currentYear = new Date().getFullYear();
  const financialYear = `${currentYear}-${currentYear + 1}`;

  // FIX: Auto-provision a LeaveBalance record if one doesn't exist yet.
  // Without this, the first-ever request for any employee always fails with
  // "Insufficient leave balance" even when they have a valid quota.
  let balance = await LeaveBalance.findOne({
    employee,
    leavePolicy,
    financialYear,
    isDeleted: false,
  });

  if (!balance) {
    const allocatedDays = policy.annualQuota || 0;
    balance = await LeaveBalance.create({
      employee,
      leavePolicy,
      financialYear,
      openingBalance: 0,
      allocatedDays,
      totalAvailable: allocatedDays,
      usedDays: 0,
      pendingDays: 0,
      balanceDays: allocatedDays,
      carryForwardDays: 0,
      lapsedDays: 0,
      lastUpdatedAt: new Date(),
    });
  }

  if (balance.balanceDays < numberOfDays) {
    throw new Error(
      `Insufficient leave balance. Available: ${balance.balanceDays} day(s), Requested: ${numberOfDays} day(s).`
    );
  } 
  
  balance.pendingDays += numberOfDays;
balance.balanceDays -= numberOfDays;
balance.lastUpdatedAt = new Date();
await balance.save();

  const leaveRequest = await LeaveRequest.create({
    employee,
    leavePolicy,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    numberOfDays,
    reason: validation.data.reason,
    attachmentFileName: validation.data.attachmentFileName,
    attachmentMimeType: validation.data.attachmentMimeType,
    attachmentContentBase64: validation.data.attachmentContentBase64,
    notes: validation.data.notes,
    managerApproval: {
      status: policy.requiresApproval ? "pending" : "approved",
      approvedAt: policy.requiresApproval ? null : new Date(),
    },
    hrApproval: {
      status: policy.requiresHRApproval ? "pending" : "approved",
      approvedAt: policy.requiresHRApproval ? null : new Date(),
    },
    status: "applied",
  });

  return leaveRequest.populate([
    { path: "employee" },
    { path: "leavePolicy" },
    { path: "managerApproval.approvedBy" },
    { path: "hrApproval.approvedBy" },
  ]);
}

export async function getLeaveRequests(filters = {}) {
  const query = { isDeleted: false };

  if (filters.employee) {
    query.employee = filters.employee;
  }

  if (filters.leavePolicy) {
    query.leavePolicy = filters.leavePolicy;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.department) {
    // Find employees in department
    const employees = await Employee.find({ department: filters.department, isDeleted: false });
    const employeeIds = employees.map((e) => e._id);
    query.employee = { $in: employeeIds };
  }

  if (filters.from || filters.to) {
    query.startDate = {};
    if (filters.from) {
      query.startDate.$gte = new Date(filters.from);
    }
    if (filters.to) {
      query.startDate.$lte = new Date(filters.to);
    }
  }

  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await LeaveRequest.countDocuments(query);
  const data = await LeaveRequest.find(query)
    .populate([
      { path: "employee" },
      { path: "leavePolicy" },
      { path: "managerApproval.approvedBy" },
      { path: "hrApproval.approvedBy" },
    ])
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  return {
    data: data.map(mapLeaveRequest),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getLeaveRequestById(id) {
  const request = await LeaveRequest.findById(id).populate([
    { path: "employee" },
    { path: "leavePolicy" },
    { path: "managerApproval.approvedBy" },
    { path: "hrApproval.approvedBy" },
  ]);

  if (!request || request.isDeleted) {
    throw new Error("Leave request not found.");
  }

  return mapLeaveRequest(request);
}

export async function approveLeaveRequest(id, approvalType, data, userId) {
  const validation = validateLeaveApproval(data);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(", "));
  }

  const leaveRequest = await LeaveRequest.findById(id);
  if (!leaveRequest || leaveRequest.isDeleted) {
    throw new Error("Leave request not found.");
  }

  if (approvalType === "manager") {
    if (leaveRequest.managerApproval.status !== "pending") {
      throw new Error("Manager approval is not pending.");
    }

    leaveRequest.managerApproval = {
      status: validation.data.status,
      approvedBy: userId,
      approvedAt: new Date(),
      remarks: validation.data.remarks,
    };
  } else if (approvalType === "hr") {
    if (leaveRequest.hrApproval.status !== "pending") {
      throw new Error("HR approval is not pending.");
    }

    leaveRequest.hrApproval = {
      status: validation.data.status,
      approvedBy: userId,
      approvedAt: new Date(),
      remarks: validation.data.remarks,
    };
  }

  // Update overall status
  if (
    leaveRequest.managerApproval.status === "approved" &&
    leaveRequest.hrApproval.status === "approved"
  ) {
    leaveRequest.status = "approved";

    const startDate = new Date(leaveRequest.startDate);
    const endDate = new Date(leaveRequest.endDate);

    // FIX: leaveRequest.leavePolicy is a raw ObjectId at this point (not populated),
    // so leaveRequest.leavePolicy.leaveType would be undefined. Fetch it explicitly.
    const leavePolicy = await LeavePolicy.findById(leaveRequest.leavePolicy);
    const leaveTypeLabel = leavePolicy ? leavePolicy.leaveType : "Leave";

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const attendanceDate = new Date(d);
      const existing = await Attendance.findOne({
        date: attendanceDate,
        entityType: "employee",
        entityId: leaveRequest.employee,
        isDeleted: false,
      });

      if (!existing) {
        await Attendance.create({
          date: attendanceDate,
          entityType: "employee",
          entityId: leaveRequest.employee,
          status: "on-leave",
          remarks: `${leaveTypeLabel} leave`,
          markedBy: userId,
        });
      }
    }

    const currentYear = new Date().getFullYear();
    const financialYear = `${currentYear}-${currentYear + 1}`;
    const balance = await LeaveBalance.findOne({
      employee: leaveRequest.employee,
      leavePolicy: leaveRequest.leavePolicy,
      financialYear,
      isDeleted: false,
    });

    if (balance) {
      balance.usedDays += leaveRequest.numberOfDays;
balance.pendingDays -= leaveRequest.numberOfDays;
balance.lastUpdatedAt = new Date();

await balance.save();
    }
  } else if (
    leaveRequest.managerApproval.status === "rejected" ||
    leaveRequest.hrApproval.status === "rejected"
  ) {
    leaveRequest.status = "rejected";

    // Update leave balance - return pending days
    const currentYear = new Date().getFullYear();
    const financialYear = `${currentYear}-${currentYear + 1}`;
    const balance = await LeaveBalance.findOne({
      employee: leaveRequest.employee,
      leavePolicy: leaveRequest.leavePolicy,
      financialYear,
      isDeleted: false,
    });

    if (balance) {
    balance.pendingDays -= leaveRequest.numberOfDays;
balance.balanceDays += leaveRequest.numberOfDays;
balance.lastUpdatedAt = new Date();

await balance.save();
    }
  } else {
    leaveRequest.status = "pending";
  }

  await leaveRequest.save();

  if (leaveRequest.status !== "pending") {
    await notifyLeaveStatusChange(leaveRequest._id, leaveRequest.employee, leaveRequest.status);
  }

  return leaveRequest.populate([
    { path: "employee" },
    { path: "leavePolicy" },
    { path: "managerApproval.approvedBy" },
    { path: "hrApproval.approvedBy" },
  ]);
}

export async function cancelLeaveRequest(id, data, userId) {
  const leaveRequest = await LeaveRequest.findById(id);
  if (!leaveRequest || leaveRequest.isDeleted) {
    throw new Error("Leave request not found.");
  }

  if (leaveRequest.status === "approved") {
    await Attendance.updateMany(
      {
        date: { $gte: leaveRequest.startDate, $lte: leaveRequest.endDate },
        entityType: "employee",
        entityId: leaveRequest.employee,
        status: "on-leave",
      },
      { isDeleted: true, deletedAt: new Date() }
    );

    const currentYear = new Date().getFullYear();
    const financialYear = `${currentYear}-${currentYear + 1}`;
    const balance = await LeaveBalance.findOne({
      employee: leaveRequest.employee,
      leavePolicy: leaveRequest.leavePolicy,
      financialYear,
      isDeleted: false,
    });

    if (balance) {
      balance.usedDays = Math.max(
  0,
  balance.usedDays - leaveRequest.numberOfDays
);

balance.balanceDays += leaveRequest.numberOfDays;
balance.lastUpdatedAt = new Date();

await balance.save();
    }
  }

  leaveRequest.status = "cancelled";
  leaveRequest.cancelledBy = userId;
  leaveRequest.cancelledAt = new Date();
  leaveRequest.cancellationReason = data.reason || "";

  await leaveRequest.save();

  await notifyLeaveStatusChange(leaveRequest._id, leaveRequest.employee, "cancelled");

  return leaveRequest.populate([
    { path: "employee" },
    { path: "leavePolicy" },
    { path: "managerApproval.approvedBy" },
    { path: "hrApproval.approvedBy" },
  ]);
}



function mapLeaveBalance(balance) {
  return {
    _id: balance._id,
    employee: balance.employee,
    leavePolicy: balance.leavePolicy,
    financialYear: balance.financialYear,
    openingBalance: balance.openingBalance,
    allocatedDays: balance.allocatedDays,
    totalAvailable: balance.totalAvailable,
    usedDays: balance.usedDays,
    pendingDays: balance.pendingDays,
    balanceDays: balance.balanceDays,
    carryForwardDays: balance.carryForwardDays,
    lapsedDays: balance.lapsedDays,
    lastUpdatedAt: balance.lastUpdatedAt,
    createdAt: balance.createdAt,
    updatedAt: balance.updatedAt,
  };
}

export async function createLeaveBalance(data) {
  const balance = await LeaveBalance.create(data);
  return balance.populate([{ path: "employee" }, { path: "leavePolicy" }]);
}

export async function getLeaveBalances(filters = {}) {
  const query = { isDeleted: false };

  if (filters.employee) {
    query.employee = filters.employee;
  }

  if (filters.leavePolicy) {
    query.leavePolicy = filters.leavePolicy;
  }

  if (filters.financialYear) {
    query.financialYear = filters.financialYear;
  }

  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await LeaveBalance.countDocuments(query);
  const data = await LeaveBalance.find(query)
    .populate([{ path: "employee" }, { path: "leavePolicy" }])
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  return {
    data: data.map(mapLeaveBalance),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getLeaveBalanceByEmployeeAndPolicy(employeeId, policyId, financialYear) {
  const balance = await LeaveBalance.findOne({
    employee: employeeId,
    leavePolicy: policyId,
    financialYear,
    isDeleted: false,
  }).populate([{ path: "employee" }, { path: "leavePolicy" }]);

  if (!balance) {
    throw new Error("Leave balance not found.");
  }

  return mapLeaveBalance(balance);
}

export async function updateLeaveBalance(id, data) {
  const balance = await LeaveBalance.findByIdAndUpdate(
    id,
    { ...data, lastUpdatedAt: new Date() },
    { new: true }
  ).populate([{ path: "employee" }, { path: "leavePolicy" }]);

  if (!balance || balance.isDeleted) {
    throw new Error("Leave balance not found.");
  }

  return mapLeaveBalance(balance);
}

export async function getEmployeeLeaveBalances(employeeId, financialYear) {
  const balances = await LeaveBalance.find({
    employee: employeeId,
    financialYear,
    isDeleted: false,
  }).populate([{ path: "leavePolicy" }]);

  return balances.map(mapLeaveBalance);
}