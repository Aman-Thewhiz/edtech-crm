import Department from "../models/Department.js";
import Designation from "../models/Designation.js";

export async function seedDesignations() {
  const count = await Designation.countDocuments();

  if (count > 0) {
    console.log("Designations already seeded.");
    return;
  }

  const hr = await Department.findOne({ code: "HR" });
  const sales = await Department.findOne({ code: "SALES" });
  const marketing = await Department.findOne({ code: "MKT" });
  const finance = await Department.findOne({ code: "FIN" });
  const it = await Department.findOne({ code: "IT" });

  await Designation.insertMany([
    {
      name: "HR Executive",
      code: "HR_EXEC",
      department: hr._id,
      level: "entry",
    },
    {
      name: "HR Manager",
      code: "HR_MGR",
      department: hr._id,
      level: "manager",
    },

    {
      name: "Sales Executive",
      code: "SALES_EXEC",
      department: sales._id,
      level: "entry",
    },
    {
      name: "Sales Manager",
      code: "SALES_MGR",
      department: sales._id,
      level: "manager",
    },

    {
      name: "Marketing Executive",
      code: "MKT_EXEC",
      department: marketing._id,
      level: "entry",
    },

    {
      name: "Software Developer",
      code: "DEV",
      department: it._id,
      level: "mid",
    },
    {
      name: "Senior Developer",
      code: "SENIOR_DEV",
      department: it._id,
      level: "senior",
    },
    {
      name: "Team Lead",
      code: "TEAM_LEAD",
      department: it._id,
      level: "lead",
    },

    {
      name: "Accountant",
      code: "ACCOUNTANT",
      department: finance._id,
      level: "entry",
    },
  ]);

  console.log("Designations seeded successfully.");
}
