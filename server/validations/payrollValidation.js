import Joi from 'joi';

const salaryStructureSchema = Joi.object({
  employee: Joi.string().required().messages({ 'any.required': 'Employee is required' }),
  effectiveFrom: Joi.date().required().messages({ 'any.required': 'Effective from date is required' }),
  effectiveTo: Joi.date().optional().allow(null),
  basic: Joi.number().required().min(0).messages({ 'any.required': 'Basic salary is required' }),
  hra: Joi.number().optional().min(0),
  da: Joi.number().optional().min(0),
  allowances: Joi.array().optional().items(
    Joi.object({
      name: Joi.string().required(),
      amount: Joi.number().required().min(0),
      isPercentageOfBasic: Joi.boolean().optional(),
    })
  ),
  deductions: Joi.array().optional().items(
    Joi.object({
      name: Joi.string().required(),
      amount: Joi.number().required().min(0),
      isPercentageOfBasic: Joi.boolean().optional(),
    })
  ),
  pfContribution: Joi.number().optional().min(0),
  ptContribution: Joi.number().optional().min(0),
  esicContribution: Joi.number().optional().min(0),
  remarks: Joi.string().optional(),
});

const payrollSchema = Joi.object({
  employee: Joi.string().required().messages({ 'any.required': 'Employee is required' }),
  month: Joi.number().required().min(1).max(12).messages({ 'any.required': 'Month is required' }),
  year: Joi.number().required().messages({ 'any.required': 'Year is required' }),
  bonus: Joi.number().optional().min(0),
  otherDeductions: Joi.number().optional().min(0),
  remarks: Joi.string().optional(),
});

const payrollApprovalSchema = Joi.object({
  status: Joi.string().required().valid('approved', 'rejected').messages({ 'any.required': 'Status is required' }),
  remarks: Joi.string().optional(),
});

const payrollProcessSchema = Joi.object({
  paymentMode: Joi.string().required().valid('bank', 'cash', 'cheque').messages({ 'any.required': 'Payment mode is required' }),
  transactionId: Joi.string().optional(),
  remarks: Joi.string().optional(),
});

export function validateSalaryStructure(data) {
  const { error, value } = salaryStructureSchema.validate(data, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return { isValid: false, errors };
  }
  return { isValid: true, data: value };
}

export function validatePayroll(data) {
  const { error, value } = payrollSchema.validate(data, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return { isValid: false, errors };
  }
  return { isValid: true, data: value };
}

export function validatePayrollApproval(data) {
  const { error, value } = payrollApprovalSchema.validate(data, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return { isValid: false, errors };
  }
  return { isValid: true, data: value };
}

export function validatePayrollProcess(data) {
  const { error, value } = payrollProcessSchema.validate(data, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return { isValid: false, errors };
  }
  return { isValid: true, data: value };
}
