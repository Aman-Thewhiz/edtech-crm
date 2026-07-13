import * as reportsService from '../services/reportsService.js';

function envelope(res, data, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({ success: true, data, message });
}

// ============ LEAD CONVERSION REPORT ============

export async function getLeadConversionReport(req, res, next) {
  try {
    const report = await reportsService.getLeadConversionReport(req.query);
    return envelope(res, { report }, 'Lead conversion report loaded');
  } catch (error) {
    next(error);
  }
}

// ============ ADMISSIONS TREND REPORT ============

export async function getAdmissionsTrendReport(req, res, next) {
  try {
    const report = await reportsService.getAdmissionsTrendReport(req.query);
    return envelope(res, { report }, 'Admissions trend report loaded');
  } catch (error) {
    next(error);
  }
}

// ============ REVENUE REPORT ============

export async function getRevenueReport(req, res, next) {
  try {
    const report = await reportsService.getRevenueReport(req.query);
    return envelope(res, { report }, 'Revenue report loaded');
  } catch (error) {
    next(error);
  }
}

// ============ STUDENT ENROLLMENT REPORT ============

export async function getStudentEnrollmentReport(req, res, next) {
  try {
    const report = await reportsService.getStudentEnrollmentReport(req.query);
    return envelope(res, { report }, 'Student enrollment report loaded');
  } catch (error) {
    next(error);
  }
}

// ============ EMPLOYEE ATTENDANCE REPORT ============

export async function getEmployeeAttendanceReport(req, res, next) {
  try {
    const report = await reportsService.getEmployeeAttendanceReport(req.query);
    return envelope(res, { report }, 'Employee attendance report loaded');
  } catch (error) {
    next(error);
  }
}

// ============ PAYROLL SUMMARY REPORT ============

export async function getPayrollSummaryReport(req, res, next) {
  try {
    const report = await reportsService.getPayrollSummaryReport(req.query);
    return envelope(res, { report }, 'Payroll summary report loaded');
  } catch (error) {
    next(error);
  }
}

// ============ EXPORT ENDPOINTS ============

export async function exportLeadConversionReport(req, res, next) {
  try {
    const report = await reportsService.getLeadConversionReport(req.query);
    const csv = reportsService.convertToCSV(
      [report],
      ['totalLeads', 'convertedLeads', 'rejectedLeads', 'pendingLeads', 'conversionRate']
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="lead-conversion-report.csv"');
    return res.send(csv);
  } catch (error) {
    next(error);
  }
}

export async function exportAdmissionsTrendReport(req, res, next) {
  try {
    const report = await reportsService.getAdmissionsTrendReport(req.query);
    const csv = reportsService.convertToCSV(report, ['month', 'admissions']);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="admissions-trend-report.csv"');
    return res.send(csv);
  } catch (error) {
    next(error);
  }
}

export async function exportRevenueReport(req, res, next) {
  try {
    const report = await reportsService.getRevenueReport(req.query);
    const csv = reportsService.convertToCSV(
      [report],
      ['totalInvoiced', 'totalCollected', 'totalOutstanding', 'collectionRate']
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="revenue-report.csv"');
    return res.send(csv);
  } catch (error) {
    next(error);
  }
}

export async function exportStudentEnrollmentReport(req, res, next) {
  try {
    const report = await reportsService.getStudentEnrollmentReport(req.query);
    const csv = reportsService.convertToCSV(
      report.byCourse,
      ['course', 'count']
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="student-enrollment-report.csv"');
    return res.send(csv);
  } catch (error) {
    next(error);
  }
}

export async function exportEmployeeAttendanceReport(req, res, next) {
  try {
    const report = await reportsService.getEmployeeAttendanceReport(req.query);
    const csv = reportsService.convertToCSV(
      report,
      ['employee', 'present', 'absent', 'halfDay', 'onLeave', 'total', 'attendancePercentage']
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="attendance-report.csv"');
    return res.send(csv);
  } catch (error) {
    next(error);
  }
}

export async function exportPayrollSummaryReport(req, res, next) {
  try {
    const report = await reportsService.getPayrollSummaryReport(req.query);
    const csv = reportsService.convertToCSV(
      report.details,
      ['employee', 'earnings', 'deductions', 'netPay', 'status']
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="payroll-summary-report.csv"');
    return res.send(csv);
  } catch (error) {
    next(error);
  }
}
