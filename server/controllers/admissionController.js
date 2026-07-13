import {
  createAdmission,
  getAdmissionById,
  listAdmissions,
  removeAdmission,
  transitionAdmissionStatus,
  updateAdmission,
  updateAdmissionChecklist,
} from '../services/admissionService.js';
import { admissionChecklistSchema, admissionSchema, admissionStatusSchema } from '../validations/admissionValidation.js';

function validate(schema, body) {
  const { error, value } = schema.validate(body);
  if (error) {
    const validationError = new Error(error.message);
    validationError.statusCode = 400;
    validationError.details = error.details;
    throw validationError;
  }
  return value;
}

function envelope(res, data, message = 'Success') {
  return res.json({ success: true, data, message });
}

export async function getAdmissions(req, res, next) {
  try {
    const data = await listAdmissions(req.query);
    return res.json({ success: true, data: data.data, message: 'Admissions loaded', pagination: data.pagination });
  } catch (error) {
    return next(error);
  }
}

export async function getAdmission(req, res, next) {
  try {
    const admission = await getAdmissionById(req.params.id);
    if (!admission) return res.status(404).json({ success: false, error: 'Admission not found' });
    return envelope(res, { admission }, 'Admission loaded');
  } catch (error) {
    return next(error);
  }
}

export async function createAdmissionController(req, res, next) {
  try {
    const value = validate(admissionSchema, req.body);
    const admission = await createAdmission(value, req.user);
    return envelope(res, { admission }, 'Admission created');
  } catch (error) {
    return next(error);
  }
}

export async function updateAdmissionController(req, res, next) {
  try {
    const schema = admissionSchema.fork(['lead'], (field) => field.optional());
    const value = validate(schema, req.body);
    const admission = await updateAdmission(req.params.id, value);
    if (!admission) return res.status(404).json({ success: false, error: 'Admission not found' });
    return envelope(res, { admission }, 'Admission updated');
  } catch (error) {
    return next(error);
  }
}

export async function deleteAdmissionController(req, res, next) {
  try {
    const admission = await removeAdmission(req.params.id);
    if (!admission) return res.status(404).json({ success: false, error: 'Admission not found' });
    return envelope(res, { admission }, 'Admission deleted');
  } catch (error) {
    return next(error);
  }
}

export async function updateAdmissionStatusController(req, res, next) {
  try {
    const { status, note } = validate(admissionStatusSchema, req.body);
    const admission = await transitionAdmissionStatus(req.params.id, status, note, req.user);
    if (!admission) return res.status(404).json({ success: false, error: 'Admission not found' });
    return envelope(res, { admission }, 'Admission status updated');
  } catch (error) {
    return next(error);
  }
}

export async function updateAdmissionChecklistController(req, res, next) {
  try {
    const { documentChecklist } = validate(admissionChecklistSchema, req.body);
    const admission = await updateAdmissionChecklist(req.params.id, documentChecklist);
    if (!admission) return res.status(404).json({ success: false, error: 'Admission not found' });
    return envelope(res, { admission }, 'Checklist updated');
  } catch (error) {
    return next(error);
  }
}
