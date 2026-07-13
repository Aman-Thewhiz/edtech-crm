import * as departmentService from "../services/departmentService.js";

function envelope(res, data, message = "Success", statusCode = 200) {
  return res.status(statusCode).json({ success: true, data, message });
}

export async function createDepartment(req, res, next) {
  try {
    const department = await departmentService.createDepartment(req.body);
    return envelope(res, { department }, "Department created", 201);
  } catch (error) {
    next(error);
  }
}

export async function getDepartments(req, res, next) {
  try {
    const data = await departmentService.getDepartments(req.query);
    return res.json({
      success: true,
      data: data.data,
      message: "Departments loaded",
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

export async function getDepartment(req, res, next) {
  try {
    const department = await departmentService.getDepartmentById(req.params.id);
    return envelope(res, { department }, "Department loaded");
  } catch (error) {
    next(error);
  }
}

export async function updateDepartment(req, res, next) {
  try {
    const department = await departmentService.updateDepartment(
      req.params.id,
      req.body
    );
    return envelope(res, { department }, "Department updated");
  } catch (error) {
    next(error);
  }
}

export async function deleteDepartment(req, res, next) {
  try {
    await departmentService.deleteDepartment(req.params.id);
    return envelope(res, {}, "Department deleted");
  } catch (error) {
    next(error);
  }
}

export async function getDepartmentStats(req, res, next) {
  try {
    const stats = await departmentService.getDepartmentStats();
    return envelope(res, stats, "Department stats loaded");
  } catch (error) {
    next(error);
  }
}
