import * as attendanceService from "../services/attendanceService.js";

function envelope(res, data, message = "Success", statusCode = 200) {
  return res.status(statusCode).json({ success: true, data, message });
}

export async function markAttendance(req, res, next) {
  try {
    const attendance = await attendanceService.markAttendance(req.body, req.user.sub);
    return envelope(res, { attendance }, "Attendance marked", 201);
  } catch (error) {
    next(error);
  }
}

export async function bulkMarkAttendance(req, res, next) {
  try {
    const result = await attendanceService.bulkMarkAttendance(req.body, req.user.sub);
    return envelope(res, result, "Bulk attendance marked");
  } catch (error) {
    next(error);
  }
}

export async function getAttendance(req, res, next) {
  try {
    const data = await attendanceService.getAttendance(req.query);
    return res.json({
      success: true,
      data: data.data,
      message: "Attendance records loaded",
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

export async function getAttendanceByEntity(req, res, next) {
  try {
    const { entityType, entityId } = req.params;
    const attendance = await attendanceService.getAttendanceByEntity(
      entityType,
      entityId,
      req.query
    );
    return envelope(res, attendance, "Attendance records loaded");
  } catch (error) {
    next(error);
  }
}

export async function getAttendanceSummary(req, res, next) {
  try {
    const { entityType, entityId, month, year } = req.query;
    const summary = await attendanceService.getAttendanceSummary(
      entityType,
      entityId,
      Number(month),
      Number(year)
    );
    return envelope(res, summary, "Attendance summary loaded");
  } catch (error) {
    next(error);
  }
}

export async function updateAttendance(req, res, next) {
  try {
    const attendance = await attendanceService.updateAttendance(
      req.params.id,
      req.body,
      req.user.sub
    );
    return envelope(res, { attendance }, "Attendance updated");
  } catch (error) {
    next(error);
  }
}

export async function deleteAttendance(req, res, next) {
  try {
    await attendanceService.deleteAttendance(req.params.id);
    return envelope(res, {}, "Attendance deleted");
  } catch (error) {
    next(error);
  }
}

export async function createHoliday(req, res, next) {
  try {
    const holiday = await attendanceService.createHoliday(req.body);
    return envelope(res, { holiday }, "Holiday created", 201);
  } catch (error) {
    next(error);
  }
}

export async function getHolidays(req, res, next) {
  try {
    const data = await attendanceService.getHolidays(req.query);
    return res.json({
      success: true,
      data: data.data,
      message: "Holidays loaded",
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

export async function getHoliday(req, res, next) {
  try {
    const holiday = await attendanceService.getHolidayById(req.params.id);
    return envelope(res, { holiday }, "Holiday loaded");
  } catch (error) {
    next(error);
  }
}

export async function updateHoliday(req, res, next) {
  try {
    const holiday = await attendanceService.updateHoliday(req.params.id, req.body);
    return envelope(res, { holiday }, "Holiday updated");
  } catch (error) {
    next(error);
  }
}

export async function deleteHoliday(req, res, next) {
  try {
    await attendanceService.deleteHoliday(req.params.id);
    return envelope(res, {}, "Holiday deleted");
  } catch (error) {
    next(error);
  }
}

export async function getAttendanceStats(req, res, next) {
  try {
    const { entityType } = req.query;
    const stats = await attendanceService.getAttendanceStats(entityType);
    return envelope(res, stats, "Attendance stats loaded");
  } catch (error) {
    next(error);
  }
}
