import Employee from "../models/Employee.js";
import Department from "../models/Department.js";

export async function generateEmployeeId(departmentId) {
  try {
    const department = await Department.findById(departmentId);
    if (!department) {
      throw new Error("Department not found");
    }

    const deptCode = department.code.toUpperCase().substring(0, 3);
    const currentYear = new Date().getFullYear();

   
    const lastEmployee = await Employee.findOne({
      department: departmentId,
      employeeId: new RegExp(`^EMP-${deptCode}-`),
    })
      .sort({ createdAt: -1 })
      .lean();

    let sequence = 1;
    if (lastEmployee && lastEmployee.employeeId) {
      const parts = lastEmployee.employeeId.split("-");
      const lastSeq = parseInt(parts[2], 10);
      if (!isNaN(lastSeq)) {
        sequence = lastSeq + 1;
      }
    }

    const employeeId = `EMP-${deptCode}-${String(sequence).padStart(4, "0")}`;
    return employeeId;
  } catch (error) {
    throw new Error(`Failed to generate employee ID: ${error.message}`);
  }
}
