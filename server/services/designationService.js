import Designation from "../models/Designation.js";
import Department from "../models/Department.js";

function mapDesignation(desig) {
  return {
    _id: desig._id,
    name: desig.name,
    code: desig.code,
    department: desig.department,
    level: desig.level,
    description: desig.description,
    status: desig.status,
    createdAt: desig.createdAt,
    updatedAt: desig.updatedAt,
  };
}

export async function createDesignation(data) {
  const department = await Department.findById(data.department);
  if (!department) {
    throw new Error("Department not found.");
  }

  const existing = await Designation.findOne({ code: data.code });
  if (existing) {
    throw new Error("Designation with this code already exists.");
  }

  const designation = await Designation.create({
    name: data.name,
    code: data.code,
    department: data.department,
    level: data.level || "entry",
    description: data.description || "",
    status: data.status || "active",
  });

  return designation.populate("department");
}

export async function getDesignations(filters = {}) {
  const query = { isDeleted: false };

  if (filters.department) {
    query.department = filters.department;
  }

  if (filters.level) {
    query.level = filters.level;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { code: { $regex: filters.search, $options: "i" } },
    ];
  }

  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;
  const skip = (page - 1) * limit;

  const [designations, total] = await Promise.all([
    Designation.find(query)
      .populate("department")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Designation.countDocuments(query),
  ]);

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    data: designations.map(mapDesignation),
  };
}

export async function getDesignationById(id) {
  const designation = await Designation.findById(id).populate("department");

  if (!designation || designation.isDeleted) {
    throw new Error("Designation not found.");
  }

  return mapDesignation(designation);
}

export async function updateDesignation(id, data) {
  const designation = await Designation.findById(id);

  if (!designation || designation.isDeleted) {
    throw new Error("Designation not found.");
  }

  if (data.code && data.code !== designation.code) {
    const existing = await Designation.findOne({ code: data.code });
    if (existing) {
      throw new Error("Designation with this code already exists.");
    }
  }

  if (data.department) {
    const department = await Department.findById(data.department);
    if (!department) {
      throw new Error("Department not found.");
    }
  }

  Object.assign(designation, {
    name: data.name ?? designation.name,
    code: data.code ?? designation.code,
    department: data.department ?? designation.department,
    level: data.level ?? designation.level,
    description: data.description ?? designation.description,
    status: data.status ?? designation.status,
  });

  await designation.save();

  return designation.populate("department");
}

export async function deleteDesignation(id) {
  const designation = await Designation.findById(id);

  if (!designation) {
    throw new Error("Designation not found.");
  }

  // Soft delete
  designation.isDeleted = true;
  designation.deletedAt = new Date();

  await designation.save();

  return { success: true };
}

export async function getDesignationStats() {
  const [totalDesignations, activeDesignations] = await Promise.all([
    Designation.countDocuments({ isDeleted: false }),

    Designation.countDocuments({
      status: "active",
      isDeleted: false,
    }),
  ]);

  return {
    totalDesignations,
    activeDesignations,
  };
}
