import Joi from 'joi';

export const admissionStatuses = ['initiated', 'documents-pending', 'documents-verified', 'fee-pending', 'enrolled'];
const genderValues = ['female', 'male', 'other', 'prefer-not-to-say'];

const checklistItemSchema = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  required: Joi.boolean().optional(),
  received: Joi.boolean().optional(),
  verified: Joi.boolean().optional(),
  notes: Joi.string().allow('').optional(),
});

export const admissionSchema = Joi.object({
  lead: Joi.string().required(),
  course: Joi.string().required(),
  batch: Joi.string().required(),
  firstName: Joi.string().min(2).max(60).required(),
  lastName: Joi.string().min(1).max(60).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^(\+91)?[0-9]{10}$/).required(),
  dateOfBirth: Joi.date().iso().allow(null).optional(),
  gender: Joi.string().valid(...genderValues).optional(),
  address: Joi.string().allow('').optional(),
  guardianName: Joi.string().allow('').optional(),
  guardianPhone: Joi.string().allow('').pattern(/^(\+91)?[0-9]{10}$/).optional(),
  documentChecklist: Joi.array().items(checklistItemSchema).optional(),
});

export const admissionStatusSchema = Joi.object({
  status: Joi.string().valid(...admissionStatuses).required(),
  note: Joi.string().allow('').optional(),
});

export const admissionChecklistSchema = Joi.object({
  documentChecklist: Joi.array().items(checklistItemSchema).min(1).required(),
});
