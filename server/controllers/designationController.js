import * as designationService from "../services/designationService.js";

function envelope(res, data, message = "Success", statusCode = 200) {
  return res.status(statusCode).json({ success: true, data, message });
}

export async function createDesignation(req, res, next) {
  try {
    const designation = await designationService.createDesignation(req.body);
    return envelope(res, { designation }, "Designation created", 201);
  } catch (error) {
    next(error);
  }
}

export async function getDesignations(req, res, next) {
  try {
    const data = await designationService.getDesignations(req.query);
    return res.json({
      success: true,
      data: data.data,
      message: "Designations loaded",
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

export async function getDesignation(req, res, next) {
  try {
    const designation = await designationService.getDesignationById(req.params.id);
    return envelope(res, { designation }, "Designation loaded");
  } catch (error) {
    next(error);
  }
}

export async function updateDesignation(req, res, next) {
  try {
    const designation = await designationService.updateDesignation(
      req.params.id,
      req.body
    );
    return envelope(res, { designation }, "Designation updated");
  } catch (error) {
    next(error);
  }
}

export async function deleteDesignation(req, res, next) {
  try {
    await designationService.deleteDesignation(req.params.id);
    return envelope(res, {}, "Designation deleted");
  } catch (error) {
    next(error);
  }
}

export async function getDesignationStats(req, res, next) {
  try {
    const stats = await designationService.getDesignationStats();
    return envelope(res, stats, "Designation stats loaded");
  } catch (error) {
    next(error);
  }
}
