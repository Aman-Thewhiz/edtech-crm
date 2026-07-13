import Joi from 'joi';

export const leadSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(7).required(),
  alternatePhone: Joi.string().allow('').optional(),
  status: Joi.string().valid('new', 'contacted', 'qualified', 'proposal', 'won', 'lost').optional(),
  source: Joi.string().valid('walk-in', 'website', 'referral', 'social-media', 'campaign').required(),
  assignedTo: Joi.string().allow(null, '').optional(),
  leadScore: Joi.number().min(1).max(5).optional(),
  followUpAt: Joi.date().iso().allow(null, '').optional(),
  notes: Joi.string().allow('').optional(),
  documents: Joi.array().items(Joi.object({ name: Joi.string().required(), url: Joi.string().uri().required() })).optional(),
});

export const leadStatusSchema = Joi.object({
  status: Joi.string().valid('new', 'contacted', 'qualified', 'proposal', 'won', 'lost').required(),
});

export const leadAssignSchema = Joi.object({
  assignedTo: Joi.string().required(),
});

export const leadActivitySchema = Joi.object({
  type: Joi.string().valid('call', 'email', 'meeting', 'note').required(),
  summary: Joi.string().min(2).required(),
  scheduledAt: Joi.date().iso().allow(null, '').optional(),
});

export const leadBulkSchema = Joi.object({
  ids: Joi.array().items(Joi.string()).min(1).required(),
  assignedTo: Joi.string().optional(),
  status: Joi.string().valid('new', 'contacted', 'qualified', 'proposal', 'won', 'lost').optional(),
});
