import Attendance from "../models/Attendance.js";
import Holiday from "../models/Holiday.js";
import Student from "../models/Student.js";
import Employee from "../models/Employee.js";
import Batch from "../models/Batch.js";
import Department from "../models/Department.js";
import { validateAttendance, validateBulkAttendance } from "../validations/attendanceValidation.js";

function mapAttendance(attendance) {
  return {
    _id: attendance._id,
    date: attendance.date,
    entityType: attendance.entityType,
    entityId: attendance.entityId,
    batch: attendance.batch,
    department: attendance.department,
    status: attendance.status,
    remarks: attendance.remarks,
    markedBy: attendance.markedBy,
    markedAt: attendance.markedAt,
    createdAt: attendance.createdAt,
    updatedAt: attendance.updatedAt,
  };
}

export async function markAttendance(data, userId) {
  const validation = validateAttendance(data);

  if (!validation.isValid) {
    throw new Error(validation.errors.join(", "));
  }

  const { date, entityType, entityId, status, remarks } = validation.data;

  // Verify entity exists
  if (entityType === "student") {
    const student = await Student.findById(entityId);
    if (!student) throw new Error("Student not found.");
  } else if (entityType === "employee") {
    const employee = await Employee.findById(entityId);
    if (!employee) throw new Error("Employee not found.");
  }

  // Check if attendance already exists for this date
  const existing = await Attendance.findOne({
    date: new Date(date),
    entityType,
    entityId,
  });

  if (existing && !existing.isDeleted) {
    throw new Error("Attendance already marked for this date.");
  }

  const attendance = await Attendance.create({
    date: new Date(date),
    entityType,
    entityId,
    batch: data.batch || null,
    department: data.department || null,
    status,
    remarks: remarks || "",
    markedBy: userId,
    markedAt: new Date(),
  });

  return attendance.populate([
    { path: "markedBy" },
    { path: "batch" },
    { path: "department" },
  ]);
}

export async function bulkMarkAttendance(data, userId) {
  const validation = validateBulkAttendance(data);

  if (!validation.isValid) {
    throw new Error(validation.errors.join(", "));
  }

  const { date, entityType, batchOrDepartment, attendanceData } = validation.data;

  const results = [];
  const errors = [];

  for (const item of attendanceData) {
    try {
      const attendanceRecord = await Attendance.findOneAndUpdate(
        {
          date: new Date(date),
          entityType,
          entityId: item.entityId,
        },
        {
          date: new Date(date),
          entityType,
          entityId: item.entityId,
          batch: entityType === "student" ? batchOrDepartment : null,
          department: entityType === "employee" ? batchOrDepartment : null,
          status: item.status,
          remarks: item.remarks || "",
          markedBy: userId,
          markedAt: new Date(),
        },
        { upsert: true, new: true }
      );

      results.push(attendanceRecord);
    } catch (error) {
      errors.push({
        entityId: item.entityId,
        error: error.message,
      });
    }
  }

  return {
    successful: results.length,
    failed: errors.length,
    results,
    errors,
  };
}

export async function getAttendance(filters = {}) {
  const query = { isDeleted: false };

  if (filters.entityType) {
    query.entityType = filters.entityType;
  }

  if (filters.entityId) {
    query.entityId = filters.entityId;
  }

  if (filters.batch) {
    query.batch = filters.batch;
  }

  if (filters.department) {
    query.department = filters.department;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.from || filters.to) {
    query.date = {};

    if (filters.from) {
      query.date.$gte = new Date(filters.from);
    }

    if (filters.to) {
      query.date.$lte = new Date(filters.to);
    }
  }

  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 50;
  const skip = (page - 1) * limit;

  const [attendance, total] = await Promise.all([
    Attendance.find(query)
      .populate("markedBy")
      .populate("batch")
      .populate("department")
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit),

    Attendance.countDocuments(query),
  ]);

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    data: attendance.map(mapAttendance),
  };
}

export async function getAttendanceByEntity(entityType, entityId, filters = {}) {
  const query = {
    isDeleted: false,
    entityType,
    entityId,
  };

  if (filters.from || filters.to) {
    query.date = {};

    if (filters.from) {
      query.date.$gte = new Date(filters.from);
    }

    if (filters.to) {
      query.date.$lte = new Date(filters.to);
    }
  }

  const attendance = await Attendance.find(query)
    .populate("markedBy")
    .sort({ date: -1 });

  return attendance.map(mapAttendance);
}

export async function getAttendanceSummary(entityType, entityId, month, year) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const attendance = await Attendance.find({
    isDeleted: false,
    entityType,
    entityId,
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  });

  const summary = {
    present: 0,
    absent: 0,
    halfDay: 0,
    onLeave: 0,
    holiday: 0,
    total: 0,
  };

  attendance.forEach((record) => {
    switch (record.status) {
      case "present":
        summary.present += 1;
        break;
      case "absent":
        summary.absent += 1;
        break;
      case "half-day":
        summary.halfDay += 1;
        break;
      case "on-leave":
        summary.onLeave += 1;
        break;
      case "holiday":
        summary.holiday += 1;
        break;
    }
    summary.total += 1;
  });

  summary.percentage = summary.total > 0 ? ((summary.present + summary.halfDay * 0.5) / summary.total * 100).toFixed(2) : 0;

  return summary;
}

export async function updateAttendance(id, data, userId) {
  const attendance = await Attendance.findById(id);

  if (!attendance || attendance.isDeleted) {
    throw new Error("Attendance record not found.");
  }

  Object.assign(attendance, {
    status: data.status ?? attendance.status,
    remarks: data.remarks ?? attendance.remarks,
    markedBy: userId,
    markedAt: new Date(),
  });

  await attendance.save();

  return attendance.populate([
    { path: "markedBy" },
    { path: "batch" },
    { path: "department" },
  ]);
}

export async function deleteAttendance(id) {
  const attendance = await Attendance.findById(id);

  if (!attendance) {
    throw new Error("Attendance record not found.");
  }

  attendance.isDeleted = true;
  attendance.deletedAt = new Date();

  await attendance.save();

  return { success: true };
}

export async function createHoliday(data) {
  const holiday = await Holiday.create({
    name: data.name,
    date: new Date(data.date),
    description: data.description || "",
    type: data.type || "national",
    applicableFor: data.applicableFor || ["both"],
  });

  return holiday;
}

export async function getHolidays(filters = {}) {
  const query = { isDeleted: false };

  if (filters.type) {
    query.type = filters.type;
  }

  if (filters.from || filters.to) {
    query.date = {};

    if (filters.from) {
      query.date.$gte = new Date(filters.from);
    }

    if (filters.to) {
      query.date.$lte = new Date(filters.to);
    }
  }

  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 50;
  const skip = (page - 1) * limit;

  const [holidays, total] = await Promise.all([
    Holiday.find(query)
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit),

    Holiday.countDocuments(query),
  ]);

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    data: holidays,
  };
}

export async function getHolidayById(id) {
  const holiday = await Holiday.findById(id);

  if (!holiday || holiday.isDeleted) {
    throw new Error("Holiday not found.");
  }

  return holiday;
}

export async function updateHoliday(id, data) {
  const holiday = await Holiday.findById(id);

  if (!holiday || holiday.isDeleted) {
    throw new Error("Holiday not found.");
  }

  Object.assign(holiday, {
    name: data.name ?? holiday.name,
    date: data.date ? new Date(data.date) : holiday.date,
    description: data.description ?? holiday.description,
    type: data.type ?? holiday.type,
    applicableFor: data.applicableFor ?? holiday.applicableFor,
  });

  await holiday.save();

  return holiday;
}

export async function deleteHoliday(id) {
  const holiday = await Holiday.findById(id);

  if (!holiday) {
    throw new Error("Holiday not found.");
  }

  holiday.isDeleted = true;
  holiday.deletedAt = new Date();

  await holiday.save();

  return { success: true };
}

export async function getAttendanceStats(entityType) {
  const [totalRecords, presentCount, absentCount] = await Promise.all([
    Attendance.countDocuments({ isDeleted: false, entityType }),

    Attendance.countDocuments({
      isDeleted: false,
      entityType,
      status: "present",
    }),

    Attendance.countDocuments({
      isDeleted: false,
      entityType,
      status: "absent",
    }),
  ]);

  return {
    totalRecords,
    presentCount,
    absentCount,
    percentage: totalRecords > 0 ? ((presentCount / totalRecords) * 100).toFixed(2) : 0,
  };
}
