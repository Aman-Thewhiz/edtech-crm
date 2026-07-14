import SalaryStructure from '../models/SalaryStructure.js';
import Payroll from '../models/Payroll.js';
import Payslip from '../models/Payslip.js';
import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import Holiday from '../models/Holiday.js';
import {
  validateSalaryStructure,
  validatePayroll,
  validatePayrollApproval,
  validatePayrollProcess,
} from '../validations/payrollValidation.js';
import { notifyPayrollProcessed } from './notificationService.js';



function mapSalaryStructure(structure) {
  return {
    _id: structure._id,
    employee: structure.employee,
    effectiveFrom: structure.effectiveFrom,
    effectiveTo: structure.effectiveTo,
    basic: structure.basic,
    hra: structure.hra,
    da: structure.da,
    allowances: structure.allowances,
    deductions: structure.deductions,
    pfContribution: structure.pfContribution,
    ptContribution: structure.ptContribution,
    esicContribution: structure.esicContribution,
    grossSalary: structure.grossSalary,
    netSalary: structure.netSalary,
    remarks: structure.remarks,
    createdAt: structure.createdAt,
    updatedAt: structure.updatedAt,
  };
}

export async function createSalaryStructure(data, userId) {
  const validation = validateSalaryStructure(data);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }

  const employee = await Employee.findById(validation.data.employee);
  if (!employee || employee.isDeleted) {
    throw new Error('Employee not found.');
  }

  // Deactivate previous salary structures
  await SalaryStructure.updateMany(
    { employee: validation.data.employee, isDeleted: false },
    { effectiveTo: new Date(validation.data.effectiveFrom) }
  );

  const structure = await SalaryStructure.create({
    ...validation.data,
    createdBy: userId,
    updatedBy: userId,
  });

  return structure.populate('employee');
}

export async function getSalaryStructures(filters = {}) {
  const query = { isDeleted: false };

  if (filters.employee) {
    query.employee = filters.employee;
  }

  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await SalaryStructure.countDocuments(query);
  const data = await SalaryStructure.find(query)
    .populate('employee')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  return {
    data: data.map(mapSalaryStructure),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getSalaryStructureById(id) {
  const structure = await SalaryStructure.findById(id).populate('employee');
  if (!structure || structure.isDeleted) {
    throw new Error('Salary structure not found.');
  }
  return mapSalaryStructure(structure);
}

export async function getActiveSalaryStructure(employeeId, date = new Date()) {
  const structure = await SalaryStructure.findOne({
    employee: employeeId,
    effectiveFrom: { $lte: date },
    $or: [{ effectiveTo: null }, { effectiveTo: { $gte: date } }],
    isDeleted: false,
  }).populate('employee');

  if (!structure) {
    throw new Error('No active salary structure found for employee.');
  }

  return mapSalaryStructure(structure);
}

export async function updateSalaryStructure(id, data, userId) {
  const structure = await SalaryStructure.findByIdAndUpdate(
    id,
    { ...data, updatedBy: userId },
    { new: true }
  ).populate('employee');

  if (!structure || structure.isDeleted) {
    throw new Error('Salary structure not found.');
  }

  return mapSalaryStructure(structure);
}

export async function deleteSalaryStructure(id) {
  const structure = await SalaryStructure.findByIdAndUpdate(
    id,
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  );

  if (!structure) {
    throw new Error('Salary structure not found.');
  }

  return { message: 'Salary structure deleted' };
}



function mapPayroll(payroll) {
  return {
    _id: payroll._id,
    employee: payroll.employee,
    month: payroll.month,
    year: payroll.year,
    salaryStructure: payroll.salaryStructure,
    attendanceData: payroll.attendanceData,
    earnings: payroll.earnings,
    deductions: payroll.deductions,
    lossOfPay: payroll.lossOfPay,
    netPay: payroll.netPay,
    status: payroll.status,
    approvedBy: payroll.approvedBy,
    approvedAt: payroll.approvedAt,
    approvalRemarks: payroll.approvalRemarks,
    paidOn: payroll.paidOn,
    paymentMode: payroll.paymentMode,
    transactionId: payroll.transactionId,
    remarks: payroll.remarks,
    createdAt: payroll.createdAt,
    updatedAt: payroll.updatedAt,
  };
}

export async function calculateAttendanceData(employeeId, month, year) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

 
  const holidays = await Holiday.find({
    date: { $gte: startDate, $lte: endDate },
    isDeleted: false,
  });

  const holidayDates = new Set(holidays.map((h) => h.date.toDateString()));

 
  const attendanceRecords = await Attendance.find({
    entityType: 'employee',
    entityId: employeeId,
    date: { $gte: startDate, $lte: endDate },
    isDeleted: false,
  });

  let presentDays = 0;
  let absentDays = 0;
  let halfDays = 0;
  let onLeaveDays = 0;
  let holidayDays = 0;

  const attendanceMap = {};
  attendanceRecords.forEach((record) => {
    attendanceMap[record.date.toDateString()] = record.status;
  });

  
  let totalWorkingDays = 0;
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toDateString();
    const dayOfWeek = d.getDay();

    
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    if (holidayDates.has(dateStr)) {
      holidayDays++;
    } else {
      totalWorkingDays++;
      const status = attendanceMap[dateStr];
      if (status === 'present') presentDays++;
      else if (status === 'absent') absentDays++;
      else if (status === 'half-day') halfDays += 0.5;
      else if (status === 'on-leave') onLeaveDays++;
    }
  }

  return {
    totalWorkingDays,
    presentDays,
    absentDays,
    halfDays,
    onLeaveDays,
    holidayDays,
  };
}

export async function generatePayroll(employeeId, month, year, data, userId) {
  const validation = validatePayroll({
    employee: employeeId,
    month,
    year,
    ...data,
  });

  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }

  
  const existing = await Payroll.findOne({
    employee: employeeId,
    month,
    year,
    isDeleted: false,
  });

  if (existing) {
    throw new Error('Payroll already exists for this employee and month.');
  }

  
  const salaryStructure = await getActiveSalaryStructure(employeeId, new Date(year, month - 1, 1));

  
  const attendanceData = await calculateAttendanceData(employeeId, month, year);

  
  const allowedAbsences = 2; 
  const excessAbsences = Math.max(0, attendanceData.absentDays - allowedAbsences);
  const dailyRate = salaryStructure.basic / attendanceData.totalWorkingDays;
  const lossOfPay = excessAbsences * dailyRate;

 
  const allowancesTotal = salaryStructure.allowances.reduce((sum, a) => {
    return sum + (a.isPercentageOfBasic ? (salaryStructure.basic * a.amount) / 100 : a.amount);
  }, 0);

  const earnings = {
    basic: salaryStructure.basic,
    hra: salaryStructure.hra,
    da: salaryStructure.da,
    allowances: allowancesTotal,
    bonus: data.bonus || 0,
    total: salaryStructure.basic + salaryStructure.hra + salaryStructure.da + allowancesTotal + (data.bonus || 0),
  };

  
  const deductionsTotal = salaryStructure.deductions.reduce((sum, d) => {
    return sum + (d.isPercentageOfBasic ? (salaryStructure.basic * d.amount) / 100 : d.amount);
  }, 0);

  const deductions = {
    pf: salaryStructure.pfContribution,
    pt: salaryStructure.ptContribution,
    esic: salaryStructure.esicContribution,
    other: data.otherDeductions || 0,
    total: salaryStructure.pfContribution + salaryStructure.ptContribution + salaryStructure.esicContribution + (data.otherDeductions || 0) + deductionsTotal,
  };

  const netPay = earnings.total - deductions.total - lossOfPay;

  const payroll = await Payroll.create({
    employee: employeeId,
    month,
    year,
    salaryStructure: salaryStructure._id,
    attendanceData,
    earnings,
    deductions,
    lossOfPay,
    netPay,
    status: 'draft',
    createdBy: userId,
  });

  return payroll.populate(['employee', 'salaryStructure']);
}

export async function getPayrolls(filters = {}) {
  const query = { isDeleted: false };

  if (filters.employee) {
    query.employee = filters.employee;
  }

  if (filters.month) {
    query.month = parseInt(filters.month);
  }

  if (filters.year) {
    query.year = parseInt(filters.year);
  }

  if (filters.status) {
    query.status = filters.status;
  }

  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await Payroll.countDocuments(query);
  const data = await Payroll.find(query)
    .populate(['employee', 'salaryStructure', 'approvedBy'])
    .skip(skip)
    .limit(limit)
    .sort({ year: -1, month: -1, createdAt: -1 });

  return {
    data: data.map(mapPayroll),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getPayrollById(id) {
  const payroll = await Payroll.findById(id).populate(['employee', 'salaryStructure', 'approvedBy']);

  if (!payroll || payroll.isDeleted) {
    throw new Error('Payroll not found.');
  }

  return mapPayroll(payroll);
}

export async function approvePayroll(id, data, userId) {
  const validation = validatePayrollApproval(data);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }

  const payroll = await Payroll.findById(id);
  if (!payroll || payroll.isDeleted) {
    throw new Error('Payroll not found.');
  }

  if (payroll.status !== 'pending') {
    throw new Error('Payroll is not pending approval.');
  }

  payroll.status = validation.data.status === 'approved' ? 'approved' : 'rejected';
  payroll.approvedBy = userId;
  payroll.approvedAt = new Date();
  payroll.approvalRemarks = validation.data.remarks;

  await payroll.save();
  return payroll.populate(['employee', 'salaryStructure', 'approvedBy']);
}

export async function processPayroll(id, data, userId) {
  const validation = validatePayrollProcess(data);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }

  const payroll = await Payroll.findById(id);
  if (!payroll || payroll.isDeleted) {
    throw new Error('Payroll not found.');
  }

  if (payroll.status !== 'approved') {
    throw new Error('Only approved payrolls can be processed.');
  }

  payroll.status = 'processed';
  payroll.paymentMode = validation.data.paymentMode;
  payroll.transactionId = validation.data.transactionId;
  payroll.paidOn = new Date();
  payroll.remarks = validation.data.remarks;

  await payroll.save();

  // Notify employee about payroll processing
  await notifyPayrollProcessed(payroll._id, payroll.employee);

  return payroll.populate(['employee', 'salaryStructure', 'approvedBy']);
}

export async function updatePayroll(id, data, userId) {
  const payroll = await Payroll.findById(id);
  if (!payroll || payroll.isDeleted) {
    throw new Error('Payroll not found.');
  }

  if (payroll.status !== 'draft') {
    throw new Error('Can only update draft payrolls.');
  }

  Object.assign(payroll, data);
  payroll.updatedBy = userId;
  await payroll.save();

  return payroll.populate(['employee', 'salaryStructure']);
}

export async function deletePayroll(id) {
  const payroll = await Payroll.findByIdAndUpdate(
    id,
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  );

  if (!payroll) {
    throw new Error('Payroll not found.');
  }

  return { message: 'Payroll deleted' };
}

// ============ PAYSLIP FUNCTIONS ============

function mapPayslip(payslip) {
  return {
    _id: payslip._id,
    payroll: payslip.payroll,
    employee: payslip.employee,
    month: payslip.month,
    year: payslip.year,
    payslipNumber: payslip.payslipNumber,
    pdfUrl: payslip.pdfUrl,
    generatedAt: payslip.generatedAt,
    downloadedAt: payslip.downloadedAt,
    emailSentAt: payslip.emailSentAt,
    status: payslip.status,
    createdAt: payslip.createdAt,
  };
}

export async function generatePayslipNumber(month, year) {
  const count = await Payslip.countDocuments({ month, year });
  return `PSL-${year}-${String(month).padStart(2, '0')}-${String(count + 1).padStart(5, '0')}`;
}

export async function createPayslip(payrollId, userId) {
  const payroll = await Payroll.findById(payrollId).populate(['employee', 'salaryStructure']);

  if (!payroll || payroll.isDeleted) {
    throw new Error('Payroll not found.');
  }

  const payslipNumber = await generatePayslipNumber(payroll.month, payroll.year);

  const payslip = await Payslip.create({
    payroll: payrollId,
    employee: payroll.employee._id,
    month: payroll.month,
    year: payroll.year,
    payslipNumber,
    generatedBy: userId,
    status: 'generated',
  });

  return payslip.populate('employee');
}

export async function getPayslips(filters = {}) {
  const query = { isDeleted: false };

  if (filters.employee) {
    query.employee = filters.employee;
  }

  if (filters.month) {
    query.month = parseInt(filters.month);
  }

  if (filters.year) {
    query.year = parseInt(filters.year);
  }

  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await Payslip.countDocuments(query);
  const data = await Payslip.find(query)
    .populate(['employee', 'payroll'])
    .skip(skip)
    .limit(limit)
    .sort({ year: -1, month: -1, createdAt: -1 });

  return {
    data: data.map(mapPayslip),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getPayslipById(id) {
  const payslip = await Payslip.findById(id).populate(['employee', 'payroll']);

  if (!payslip || payslip.isDeleted) {
    throw new Error('Payslip not found.');
  }

  return mapPayslip(payslip);
}

export async function markPayslipDownloaded(id, userId) {
  const payslip = await Payslip.findByIdAndUpdate(
    id,
    {
      downloadedAt: new Date(),
      downloadedBy: userId,
      status: 'downloaded',
    },
    { new: true }
  ).populate(['employee', 'payroll']);

  if (!payslip) {
    throw new Error('Payslip not found.');
  }

  return mapPayslip(payslip);
}
