import Joi from 'joi';

const statusValues = ['active', 'inactive', 'completed', 'cancelled'];

export const courseSchema = Joi.object({
  name: Joi.string().min(2).required(),
  description: Joi.string().allow('').optional(),
  duration: Joi.string().min(1).required(),
  fee: Joi.number().min(0).required(),
  category: Joi.string().required(),
  status: Joi.string().valid(...statusValues).optional(),
});

export const courseStatusSchema = Joi.object({
  status: Joi.string().valid(...statusValues).required(),
});

export const batchSchema = Joi.object({
  course: Joi.string().required(),
  name: Joi.string().min(2).required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
  capacity: Joi.number().integer().min(1).required(),
  schedule: Joi.string().min(2).required(),
  status: Joi.string().valid(...statusValues).optional(),
  enrollmentCount: Joi.number().integer().min(0).optional(),
});

export const batchStatusSchema = Joi.object({
  status: Joi.string().valid(...statusValues).required(),
});