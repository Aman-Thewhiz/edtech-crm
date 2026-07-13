import Employee from "../models/Employee.js";
import Department from "../models/Department.js";
import Designation from "../models/Designation.js";
import { generateEmployeeId } from "../utils/employeeId.js";

function fullName(employee) {
  return `${employee.firstName} ${employee.lastName}`.trim();
}

function mapEmployee(employee) {
  return {
    _id: employee._id,
    employeeId: employee.employeeId,
    firstName: employee.firstName,
    lastName: employee.lastName,
    name: fullName(employee),
    email: employee.email,
    phone: employee.phone,
    dateOfBirth: employee.dateOfBirth,
    gender: employee.gender,
    address: employee.address,
    department: employee.department,
    designation: employee.designation,
    joiningDate: employee.joiningDate,
    employmentType: employee.employmentType,
    status: employee.status,
    bankAccountNumber: employee.bankAccountNumber,
    bankIFSC: employee.bankIFSC,
    bankAccountHolderName: employee.bankAccountHolderName,
    documents: employee.documents,
    onboardingChecklist: employee.onboardingChecklist,
    createdAt: employee.createdAt,
    updatedAt: employee.updatedAt,
  };
}

export async function createEmployee(data) {
  const department = await Department.findById(data.department);
  if (!department) {
    throw new Error("Department not found.");
  }

  const designation = await Designation.findById(data.designation);
  if (!designation) {
    throw new Error("Designation not found.");
  }

  const employeeId = await generateEmployeeId(data.department);

  const employee = await Employee.create({
    employeeId,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    dateOfBirth: data.dateOfBirth || null,
    gender: data.gender || null,
    address: data.address || "",
    department: data.department,
    designation: data.designation,
    joiningDate: data.joiningDate,
    employmentType: data.employmentType || "full-time",
    status: data.status || "active",
    bankAccountNumber: data.bankAccountNumber || "",
    bankIFSC: data.bankIFSC || "",
    bankAccountHolderName: data.bankAccountHolderName || "",
    onboardingChecklist: data.onboardingChecklist || [],
  });

  return employee.populate([
    { path: "department" },
    { path: "designation" },
  ]);
}

export async function getEmployees(filters = {}) {
  const query = { isDeleted: false };

  if (filters.department) {
    query.department = filters.department;
  }

  if (filters.designation) {
    query.designation = filters.designation;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.search) {
    query.$or = [
      { firstName: { $regex: filters.search, $options: "i" } },
      { lastName: { $regex: filters.search, $options: "i" } },
      { email: { $regex: filters.search, $options: "i" } },
      { phone: { $regex: filters.search, $options: "i" } },
      { employeeId: { $regex: filters.search, $options: "i" } },
    ];
  }

  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;
  const skip = (page - 1) * limit;

  const [employees, total] = await Promise.all([
    Employee.find(query)
      .populate("department")
      .populate("designation")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Employee.countDocuments(query),
  ]);

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    data: employees.map(mapEmployee),
  };
}

export async function getEmployeeById(id) {
  const employee = await Employee.findById(id)
    .populate("department")
    .populate("designation");

  if (!employee || employee.isDeleted) {
    throw new Error("Employee not found.");
  }

  return mapEmployee(employee);
}

export async function updateEmployee(id, data) {
  const employee = await Employee.findById(id);

  if (!employee || employee.isDeleted) {
    throw new Error("Employee not found.");
  }

  if (data.department) {
    const department = await Department.findById(data.department);
    if (!department) {
      throw new Error("Department not found.");
    }
  }

  if (data.designation) {
    const designation = await Designation.findById(data.designation);
    if (!designation) {
      throw new Error("Designation not found.");
    }
  }

  Object.assign(employee, {
    firstName: data.firstName ?? employee.firstName,
    lastName: data.lastName ?? employee.lastName,
    email: data.email ?? employee.email,
    phone: data.phone ?? employee.phone,
    dateOfBirth: data.dateOfBirth ?? employee.dateOfBirth,
    gender: data.gender ?? employee.gender,
    address: data.address ?? employee.address,
    department: data.department ?? employee.department,
    designation: data.designation ?? employee.designation,
    joiningDate: data.joiningDate ?? employee.joiningDate,
    employmentType: data.employmentType ?? employee.employmentType,
    status: data.status ?? employee.status,
    bankAccountNumber: data.bankAccountNumber ?? employee.bankAccountNumber,
    bankIFSC: data.bankIFSC ?? employee.bankIFSC,
    bankAccountHolderName: data.bankAccountHolderName ?? employee.bankAccountHolderName,
  });

  await employee.save();

  return employee.populate([
    { path: "department" },
    { path: "designation" },
  ]);
}

export async function updateEmployeeStatus(id, status) {
  const employee = await Employee.findById(id);

  if (!employee || employee.isDeleted) {
    throw new Error("Employee not found.");
  }

  employee.status = status;
  await employee.save();

  return mapEmployee(employee);
}

export async function updateOnboardingChecklist(id, checklist) {
  const employee = await Employee.findById(id);

  if (!employee || employee.isDeleted) {
    throw new Error("Employee not found.");
  }

  employee.onboardingChecklist = checklist.map((item) => ({
    item: item.item,
    completed: item.completed || false,
    completedAt: item.completed ? item.completedAt || new Date() : null,
  }));

  await employee.save();

  return mapEmployee(employee);
}

export async function uploadEmployeeDocument(id, documentData) {
  const employee = await Employee.findById(id);

  if (!employee || employee.isDeleted) {
    throw new Error("Employee not found.");
  }

  const document = {
    type: documentData.type,
    name: documentData.name,
    fileName: documentData.fileName,
    mimeType: documentData.mimeType,
    contentBase64: documentData.contentBase64,
    uploadedAt: new Date(),
  };

  employee.documents.push(document);
  await employee.save();

  return mapEmployee(employee);
}

export async function deleteEmployee(id) {
  const employee = await Employee.findById(id);

  if (!employee) {
    throw new Error("Employee not found.");
  }

  // Soft delete
  employee.isDeleted = true;
  employee.deletedAt = new Date();

  await employee.save();

  return { success: true };
}

export async function getEmployeeStats() {
  const [totalEmployees, activeEmployees, onLeaveEmployees] = await Promise.all([
    Employee.countDocuments({ isDeleted: false }),

    Employee.countDocuments({
      status: "active",
      isDeleted: false,
    }),

    Employee.countDocuments({
      status: "on-leave",
      isDeleted: false,
    }),
  ]);

  return {
    totalEmployees,
    activeEmployees,
    onLeaveEmployees,
  };
}
