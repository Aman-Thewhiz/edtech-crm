import * as employeeService from "../services/employeeService.js";

function envelope(res, data, message = "Success", statusCode = 200) {
  return res.status(statusCode).json({ success: true, data, message });
}

export async function createEmployee(req, res, next) {
  try {
    const employee = await employeeService.createEmployee(req.body);
    return envelope(res, { employee }, "Employee created", 201);
  } catch (error) {
    next(error);
  }
}

export async function getEmployees(req, res, next) {
  try {
    const data = await employeeService.getEmployees(req.query);
    return res.json({
      success: true,
      data: data.data,
      message: "Employees loaded",
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

export async function getEmployee(req, res, next) {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id);
    return envelope(res, { employee }, "Employee loaded");
  } catch (error) {
    next(error);
  }
}

export async function updateEmployee(req, res, next) {
  try {
    const employee = await employeeService.updateEmployee(req.params.id, req.body);
    return envelope(res, { employee }, "Employee updated");
  } catch (error) {
    next(error);
  }
}

export async function updateEmployeeStatus(req, res, next) {
  try {
    const employee = await employeeService.updateEmployeeStatus(
      req.params.id,
      req.body.status
    );
    return envelope(res, { employee }, "Employee status updated");
  } catch (error) {
    next(error);
  }
}

export async function updateOnboardingChecklist(req, res, next) {
  try {
    const employee = await employeeService.updateOnboardingChecklist(
      req.params.id,
      req.body.checklist
    );
    return envelope(res, { employee }, "Onboarding checklist updated");
  } catch (error) {
    next(error);
  }
}

export async function uploadEmployeeDocument(req, res, next) {
  try {
    const employee = await employeeService.uploadEmployeeDocument(
      req.params.id,
      req.body
    );
    return envelope(res, { employee }, "Document uploaded");
  } catch (error) {
    next(error);
  }
}

export async function deleteEmployee(req, res, next) {
  try {
    await employeeService.deleteEmployee(req.params.id);
    return envelope(res, {}, "Employee deleted");
  } catch (error) {
    next(error);
  }
}

export async function getEmployeeStats(req, res, next) {
  try {
    const stats = await employeeService.getEmployeeStats();
    return envelope(res, stats, "Employee stats loaded");
  } catch (error) {
    next(error);
  }
}
