import LeavePolicy from "../models/LeavePolicy.js";

export async function seedLeavePolicies() {
  const existingPolicies = await LeavePolicy.countDocuments({ isDeleted: false });
  if (existingPolicies > 0) {
    console.log("Leave policies already exist, skipping seed.");
    return;
  }

  const policies = [
    {
      leaveType: "casual",
      code: "CL",
      description: "Casual leave for personal reasons",
      annualQuota: 12,
      carryForwardAllowed: true,
      carryForwardLimit: 5,
      minimumDaysPerRequest: 0.5,
      maxConsecutiveDays: null,
      requiresApproval: true,
      requiresHRApproval: false,
      isActive: true,
    },
    {
      leaveType: "sick",
      code: "SL",
      description: "Sick leave for medical reasons",
      annualQuota: 10,
      carryForwardAllowed: false,
      carryForwardLimit: 0,
      minimumDaysPerRequest: 0.5,
      maxConsecutiveDays: 30,
      requiresApproval: true,
      requiresHRApproval: false,
      isActive: true,
    },
    {
      leaveType: "earned",
      code: "EL",
      description: "Earned leave",
      annualQuota: 20,
      carryForwardAllowed: true,
      carryForwardLimit: 10,
      minimumDaysPerRequest: 1,
      maxConsecutiveDays: null,
      requiresApproval: true,
      requiresHRApproval: false,
      isActive: true,
    },
    {
      leaveType: "unpaid",
      code: "UL",
      description: "Unpaid leave",
      annualQuota: 0,
      carryForwardAllowed: false,
      carryForwardLimit: 0,
      minimumDaysPerRequest: 1,
      maxConsecutiveDays: 30,
      requiresApproval: true,
      requiresHRApproval: true,
      isActive: true,
    },
    {
      leaveType: "maternity",
      code: "ML",
      description: "Maternity leave",
      annualQuota: 180,
      carryForwardAllowed: false,
      carryForwardLimit: 0,
      minimumDaysPerRequest: 1,
      maxConsecutiveDays: 180,
      requiresApproval: true,
      requiresHRApproval: true,
      isActive: true,
    },
    {
      leaveType: "paternity",
      code: "PL",
      description: "Paternity leave",
      annualQuota: 15,
      carryForwardAllowed: false,
      carryForwardLimit: 0,
      minimumDaysPerRequest: 1,
      maxConsecutiveDays: 15,
      requiresApproval: true,
      requiresHRApproval: true,
      isActive: true,
    },
    {
      leaveType: "bereavement",
      code: "BL",
      description: "Bereavement leave",
      annualQuota: 5,
      carryForwardAllowed: false,
      carryForwardLimit: 0,
      minimumDaysPerRequest: 1,
      maxConsecutiveDays: 5,
      requiresApproval: false,
      requiresHRApproval: false,
      isActive: true,
    },
  ];

  await LeavePolicy.insertMany(policies);
  console.log("Leave policies seeded successfully.");
}
