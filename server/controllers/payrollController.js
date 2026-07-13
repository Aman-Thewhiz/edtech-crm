import * as payrollService from '../services/payrollService.js';

function envelope(res, data, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({ success: true, data, message });
}

// ============ SALARY STRUCTURE ENDPOINTS ============

export async function createSalaryStructure(req, res, next) {
  try {
    const structure = await payrollService.createSalaryStructure(req.body, req.user.sub);
    return envelope(res, { structure }, 'Salary structure created', 201);
  } catch (error) {
    next(error);
  }
}

export async function getSalaryStructures(req, res, next) {
  try {
    const data = await payrollService.getSalaryStructures(req.query);
    return res.json({
      success: true,
      data: data.data,
      message: 'Salary structures loaded',
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

export async function getSalaryStructure(req, res, next) {
  try {
    const structure = await payrollService.getSalaryStructureById(req.params.id);
    return envelope(res, { structure }, 'Salary structure loaded');
  } catch (error) {
    next(error);
  }
}

export async function updateSalaryStructure(req, res, next) {
  try {
    const structure = await payrollService.updateSalaryStructure(req.params.id, req.body, req.user.sub);
    return envelope(res, { structure }, 'Salary structure updated');
  } catch (error) {
    next(error);
  }
}

export async function deleteSalaryStructure(req, res, next) {
  try {
    const result = await payrollService.deleteSalaryStructure(req.params.id);
    return envelope(res, result, 'Salary structure deleted');
  } catch (error) {
    next(error);
  }
}

// ============ PAYROLL ENDPOINTS ============

export async function generatePayroll(req, res, next) {
  try {
    const { employeeId } = req.params;
    const { month, year } = req.body;

    const payroll = await payrollService.generatePayroll(employeeId, month, year, req.body, req.user.sub);
    return envelope(res, { payroll }, 'Payroll generated', 201);
  } catch (error) {
    next(error);
  }
}

export async function getPayrolls(req, res, next) {
  try {
    const data = await payrollService.getPayrolls(req.query);
    return res.json({
      success: true,
      data: data.data,
      message: 'Payrolls loaded',
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

export async function getPayroll(req, res, next) {
  try {
    const payroll = await payrollService.getPayrollById(req.params.id);
    return envelope(res, { payroll }, 'Payroll loaded');
  } catch (error) {
    next(error);
  }
}

export async function approvePayroll(req, res, next) {
  try {
    const payroll = await payrollService.approvePayroll(req.params.id, req.body, req.user.sub);
    return envelope(res, { payroll }, 'Payroll approved');
  } catch (error) {
    next(error);
  }
}

export async function processPayroll(req, res, next) {
  try {
    const payroll = await payrollService.processPayroll(req.params.id, req.body, req.user.sub);
    return envelope(res, { payroll }, 'Payroll processed');
  } catch (error) {
    next(error);
  }
}

export async function updatePayroll(req, res, next) {
  try {
    const payroll = await payrollService.updatePayroll(req.params.id, req.body, req.user.sub);
    return envelope(res, { payroll }, 'Payroll updated');
  } catch (error) {
    next(error);
  }
}

export async function deletePayroll(req, res, next) {
  try {
    const result = await payrollService.deletePayroll(req.params.id);
    return envelope(res, result, 'Payroll deleted');
  } catch (error) {
    next(error);
  }
}

// ============ PAYSLIP ENDPOINTS ============

export async function createPayslip(req, res, next) {
  try {
    const { payrollId } = req.params;
    const payslip = await payrollService.createPayslip(payrollId, req.user.sub);
    return envelope(res, { payslip }, 'Payslip created', 201);
  } catch (error) {
    next(error);
  }
}

export async function getPayslips(req, res, next) {
  try {
    const data = await payrollService.getPayslips(req.query);
    return res.json({
      success: true,
      data: data.data,
      message: 'Payslips loaded',
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

export async function getPayslip(req, res, next) {
  try {
    const payslip = await payrollService.getPayslipById(req.params.id);
    return envelope(res, { payslip }, 'Payslip loaded');
  } catch (error) {
    next(error);
  }
}

export async function markPayslipDownloaded(req, res, next) {
  try {
    const payslip = await payrollService.markPayslipDownloaded(req.params.id, req.user.sub);
    return envelope(res, { payslip }, 'Payslip marked as downloaded');
  } catch (error) {
    next(error);
  }
}
