import Joi from "joi";

const leavePolicySchema = Joi.object({
  leaveType: Joi.string()
    .required()
    .valid("casual", "sick", "earned", "unpaid", "maternity", "paternity", "bereavement")
    .messages({ "any.required": "Leave type is required" }),
  code: Joi.string().required().uppercase().messages({ "any.required": "Code is required" }),
  description: Joi.string().optional(),
  annualQuota: Joi.number().required().min(0).messages({ "any.required": "Annual quota is required" }),
  carryForwardAllowed: Joi.boolean().optional(),
  carryForwardLimit: Joi.number().min(0).optional(),
  minimumDaysPerRequest: Joi.number().min(0.5).optional(),
  maxConsecutiveDays: Joi.number().min(1).optional().allow(null),
  requiresApproval: Joi.boolean().optional(),
  requiresHRApproval: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
});

const leaveRequestSchema = Joi.object({
  employee: Joi.string().required().messages({ "any.required": "Employee is required" }),
  leavePolicy: Joi.string().required().messages({ "any.required": "Leave type is required" }),
  startDate: Joi.date().required().messages({ "any.required": "Start date is required" }),
  endDate: Joi.date().required().messages({ "any.required": "End date is required" }),
  numberOfDays: Joi.number().required().min(0.5).messages({ "any.required": "Number of days is required" }),
  reason: Joi.string().required().trim().messages({ "any.required": "Reason is required" }),
  attachmentFileName: Joi.string().optional(),
  attachmentMimeType: Joi.string().optional(),
  attachmentContentBase64: Joi.string().optional(),
  notes: Joi.string().optional().trim(),
});

const leaveApprovalSchema = Joi.object({
  status: Joi.string().required().valid("approved", "rejected").messages({ "any.required": "Status is required" }),
  remarks: Joi.string().optional().trim(),
});

const leavePolicyUpdateSchema = Joi.object({
  leaveType: Joi.string().optional(),
  code: Joi.string().optional().uppercase(),
  description: Joi.string().optional(),
  annualQuota: Joi.number().optional().min(0),
  carryForwardAllowed: Joi.boolean().optional(),
  carryForwardLimit: Joi.number().min(0).optional(),
  minimumDaysPerRequest: Joi.number().min(0.5).optional(),
  maxConsecutiveDays: Joi.number().min(1).optional().allow(null),
  requiresApproval: Joi.boolean().optional(),
  requiresHRApproval: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
});

export function validateLeavePolicy(data) {
  const { error, value } = leavePolicySchema.validate(data, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return { isValid: false, errors };
  }
  return { isValid: true, data: value };
}

export function validateLeavePolicyUpdate(data) {
  const { error, value } = leavePolicyUpdateSchema.validate(data, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return { isValid: false, errors };
  }
  return { isValid: true, data: value };
}

export function validateLeaveRequest(data) {
  const { error, value } = leaveRequestSchema.validate(data, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return { isValid: false, errors };
  }
  return { isValid: true, data: value };
}

export function validateLeaveApproval(data) {
  const { error, value } = leaveApprovalSchema.validate(data, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return { isValid: false, errors };
  }
  return { isValid: true, data: value };
}
