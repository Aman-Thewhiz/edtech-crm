import Joi from 'joi';

const statusValues = ['active', 'inactive', 'graduated', 'dropped'];
const genderValues = ['female', 'male', 'other', 'prefer-not-to-say'];
const documentTypes = ['id-proof', 'photo', 'certificate', 'other'];

export const studentSchema = Joi.object({
  firstName: Joi.string().min(2).max(60).required(),
  lastName: Joi.string().min(1).max(60).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^(\+91)?[0-9]{10}$/).required(),
  dateOfBirth: Joi.date().iso().allow(null).optional(),
  gender: Joi.string().valid(...genderValues).optional(),
  address: Joi.string().allow('').optional(),
  guardianName: Joi.string().allow('').optional(),
  guardianPhone: Joi.string().allow('').pattern(/^(\+91)?[0-9]{10}$/).optional(),
  course: Joi.string().required(),
  batch: Joi.string().required(),
  admission: Joi.string().allow('', null).optional(),
  status: Joi.string().valid(...statusValues).optional(),
  enrollmentDate: Joi.date().iso().optional(),
});

export const studentStatusSchema = Joi.object({
  status: Joi.string().valid(...statusValues).required(),
});

export const studentDocumentSchema = Joi.object({
  type: Joi.string().valid(...documentTypes).required(),
  name: Joi.string().min(2).max(120).required(),
  fileName: Joi.string().min(2).max(180).required(),
  mimeType: Joi.string().allow('').optional(),
  contentBase64: Joi.string().min(1).required(),
});
