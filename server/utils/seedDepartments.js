import Department from "../models/Department.js";

export async function seedDepartments() {
  const count = await Department.countDocuments();

  if (count > 0) {
    console.log("Departments already seeded.");
    return;
  }

  await Department.insertMany([
    {
      name: "Human Resources",
      code: "HR",
      description: "Handles employees and HR operations",
    },
    {
      name: "Sales",
      code: "SALES",
      description: "Sales department",
    },
    {
      name: "Marketing",
      code: "MKT",
      description: "Marketing department",
    },
    {
      name: "Finance",
      code: "FIN",
      description: "Finance department",
    },
    {
      name: "Information Technology",
      code: "IT",
      description: "Technology department",
    },
    {
      name: "Operations",
      code: "OPS",
      description: "Operations department",
    },
  ]);

  console.log("Departments seeded successfully.");
}
