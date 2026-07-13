import Department from "../models/Department.js";

function mapDepartment(dept) {
  return {
    _id: dept._id,
    name: dept.name,
    code: dept.code,
    description: dept.description,
    headEmployee: dept.headEmployee,
    parentDepartment: dept.parentDepartment,
    status: dept.status,
    createdAt: dept.createdAt,
    updatedAt: dept.updatedAt,
  };
}

export async function createDepartment(data) {
  const existing = await Department.findOne({
    $or: [{ name: data.name }, { code: data.code }],
  });

  if (existing) {
    throw new Error("Department with this name or code already exists.");
  }

  const department = await Department.create({
    name: data.name,
    code: data.code,
    description: data.description || "",
    headEmployee: data.headEmployee || null,
    parentDepartment: data.parentDepartment || null,
    status: data.status || "active",
  });

  return mapDepartment(department);
}

export async function getDepartments(filters = {}) {
  const query = { isDeleted: false };

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

  const [departments, total] = await Promise.all([
    Department.find(query)
      .populate("headEmployee")
      .populate("parentDepartment")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Department.countDocuments(query),
  ]);

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    data: departments.map(mapDepartment),
  };
}

export async function getDepartmentById(id) {
  const department = await Department.findById(id)
    .populate("headEmployee")
    .populate("parentDepartment");

  if (!department || department.isDeleted) {
    throw new Error("Department not found.");
  }

  return mapDepartment(department);
}

export async function updateDepartment(id, data) {
  const department = await Department.findById(id);

  if (!department || department.isDeleted) {
    throw new Error("Department not found.");
  }

  // Check for duplicate name/code
  if (data.name && data.name !== department.name) {
    const existing = await Department.findOne({ name: data.name });
    if (existing) {
      throw new Error("Department with this name already exists.");
    }
  }

  if (data.code && data.code !== department.code) {
    const existing = await Department.findOne({ code: data.code });
    if (existing) {
      throw new Error("Department with this code already exists.");
    }
  }

  Object.assign(department, {
    name: data.name ?? department.name,
    code: data.code ?? department.code,
    description: data.description ?? department.description,
    headEmployee: data.headEmployee ?? department.headEmployee,
    parentDepartment: data.parentDepartment ?? department.parentDepartment,
    status: data.status ?? department.status,
  });

  await department.save();

  return department.populate([
    { path: "headEmployee" },
    { path: "parentDepartment" },
  ]);
}

export async function deleteDepartment(id) {
  const department = await Department.findById(id);

  if (!department) {
    throw new Error("Department not found.");
  }

  // Soft delete
  department.isDeleted = true;
  department.deletedAt = new Date();

  await department.save();

  return { success: true };
}

export async function getDepartmentStats() {
  const [totalDepartments, activeDepartments] = await Promise.all([
    Department.countDocuments({ isDeleted: false }),

    Department.countDocuments({
      status: "active",
      isDeleted: false,
    }),
  ]);

  return {
    totalDepartments,
    activeDepartments,
  };
}
