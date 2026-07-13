import Lead from '../models/Lead.js';
import Admission from '../models/Admission.js';
import Invoice from '../models/Invoice.js';
import Payment from '../models/Payment.js';
import Student from '../models/Student.js';
import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import Payroll from '../models/Payroll.js';

// ============ LEAD CONVERSION FUNNEL ============

export async function getLeadConversionReport(filters = {}) {
  const query = { isDeleted: false };

  if (filters.from || filters.to) {
    query.createdAt = {};
    if (filters.from) query.createdAt.$gte = new Date(filters.from);
    if (filters.to) query.createdAt.$lte = new Date(filters.to);
  }

  const leads = await Lead.countDocuments(query);
  const converted = await Lead.countDocuments({ ...query, status: 'converted' });
  const rejected = await Lead.countDocuments({ ...query, status: 'rejected' });
  const pending = await Lead.countDocuments({ ...query, status: 'pending' });

  const conversionRate = leads > 0 ? ((converted / leads) * 100).toFixed(2) : 0;

  return {
    totalLeads: leads,
    convertedLeads: converted,
    rejectedLeads: rejected,
    pendingLeads: pending,
    conversionRate: parseFloat(conversionRate),
  };
}

// ============ ADMISSIONS TREND ============

export async function getAdmissionsTrendReport(filters = {}) {
  const query = { isDeleted: false };

  if (filters.course) {
    query.course = filters.course;
  }

  // Group by month
  const pipeline = [
    { $match: query },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ];

  const trend = await Admission.aggregate(pipeline);

  const formattedTrend = trend.map((item) => ({
    month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
    admissions: item.count,
  }));

  return formattedTrend;
}

// ============ REVENUE REPORT ============

export async function getRevenueReport(filters = {}) {
  const query = { isDeleted: false };

  if (filters.from || filters.to) {
    query.createdAt = {};
    if (filters.from) query.createdAt.$gte = new Date(filters.from);
    if (filters.to) query.createdAt.$lte = new Date(filters.to);
  }

  // Get all invoices
  const invoices = await Invoice.find(query);

  let totalInvoiced = 0;
  let totalCollected = 0;
  let totalOutstanding = 0;

  for (const invoice of invoices) {
    totalInvoiced += invoice.amount;

    // Get payments for this invoice
    const payments = await Payment.find({
      invoice: invoice._id,
      status: 'completed',
      isDeleted: false,
    });

    const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    totalCollected += paidAmount;
    totalOutstanding += invoice.amount - paidAmount;
  }

  const collectionRate = totalInvoiced > 0 ? ((totalCollected / totalInvoiced) * 100).toFixed(2) : 0;

  return {
    totalInvoiced,
    totalCollected,
    totalOutstanding,
    collectionRate: parseFloat(collectionRate),
  };
}

// ============ STUDENT ENROLLMENT ============

export async function getStudentEnrollmentReport(filters = {}) {
  const query = { isDeleted: false };

  if (filters.course) {
    query.course = filters.course;
  }

  if (filters.batch) {
    query.batch = filters.batch;
  }

  const totalStudents = await Student.countDocuments(query);
  const activeStudents = await Student.countDocuments({ ...query, status: 'active' });
  const inactiveStudents = await Student.countDocuments({ ...query, status: 'inactive' });

  // Group by course
  const byCourse = await Student.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$course',
        count: { $sum: 1 },
      },
    },
    { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'courseInfo' } },
    { $unwind: '$courseInfo' },
    { $project: { course: '$courseInfo.name', count: 1 } },
  ]);

  return {
    totalStudents,
    activeStudents,
    inactiveStudents,
    byCourse,
  };
}

// ============ EMPLOYEE ATTENDANCE REPORT ============

export async function getEmployeeAttendanceReport(filters = {}) {
  const query = { isDeleted: false };

  if (filters.department) {
    const deptEmployees = await Employee.find({ department: filters.department, isDeleted: false });
    const employeeIds = deptEmployees.map((e) => e._id);
    query.entityId = { $in: employeeIds };
  }

  query.entityType = 'employee';

  if (filters.from || filters.to) {
    query.date = {};
    if (filters.from) query.date.$gte = new Date(filters.from);
    if (filters.to) query.date.$lte = new Date(filters.to);
  }

  // Group by employee
  const pipeline = [
    { $match: query },
    {
      $group: {
        _id: '$entityId',
        present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
        absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
        halfDay: { $sum: { $cond: [{ $eq: ['$status', 'half-day'] }, 1, 0] } },
        onLeave: { $sum: { $cond: [{ $eq: ['$status', 'on-leave'] }, 1, 0] } },
        total: { $sum: 1 },
      },
    },
    { $lookup: { from: 'employees', localField: '_id', foreignField: '_id', as: 'employee' } },
    { $unwind: '$employee' },
    {
      $project: {
        employee: '$employee.name',
        present: 1,
        absent: 1,
        halfDay: 1,
        onLeave: 1,
        total: 1,
        percentage: { $multiply: [{ $divide: ['$present', '$total'] }, 100] },
      },
    },
  ];

  const report = await Attendance.aggregate(pipeline);

  return report.map((item) => ({
    employee: item.employee,
    present: item.present,
    absent: item.absent,
    halfDay: item.halfDay,
    onLeave: item.onLeave,
    total: item.total,
    attendancePercentage: parseFloat(item.percentage.toFixed(2)),
  }));
}

// ============ PAYROLL SUMMARY REPORT ============

export async function getPayrollSummaryReport(filters = {}) {
  const query = { isDeleted: false };

  if (filters.month) {
    query.month = parseInt(filters.month);
  }

  if (filters.year) {
    query.year = parseInt(filters.year);
  }

  if (filters.department) {
    const deptEmployees = await Employee.find({ department: filters.department, isDeleted: false });
    const employeeIds = deptEmployees.map((e) => e._id);
    query.employee = { $in: employeeIds };
  }

  const payrolls = await Payroll.find(query).populate('employee');

  let totalEarnings = 0;
  let totalDeductions = 0;
  let totalNetPay = 0;
  let processedCount = 0;
  let pendingCount = 0;

  const details = payrolls.map((p) => {
    totalEarnings += p.earnings.total;
    totalDeductions += p.deductions.total;
    totalNetPay += p.netPay;

    if (p.status === 'processed' || p.status === 'paid') processedCount++;
    if (p.status === 'pending') pendingCount++;

    return {
      employee: p.employee.name,
      earnings: p.earnings.total,
      deductions: p.deductions.total,
      netPay: p.netPay,
      status: p.status,
    };
  });

  return {
    summary: {
      totalEarnings,
      totalDeductions,
      totalNetPay,
      processedCount,
      pendingCount,
      totalRecords: payrolls.length,
    },
    details,
  };
}

// ============ EXPORT HELPERS ============

export function convertToCSV(data, headers) {
  const csvHeaders = headers.join(',');
  const csvRows = data.map((row) =>
    headers.map((header) => {
      const value = row[header];
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      return value;
    }).join(',')
  );

  return [csvHeaders, ...csvRows].join('\n');
}

export function convertToPDFData(reportName, data) {
  return {
    title: reportName,
    content: JSON.stringify(data, null, 2),
    generatedAt: new Date().toLocaleString(),
  };
}
