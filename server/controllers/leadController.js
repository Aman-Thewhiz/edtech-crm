import {
  addLeadActivity,
  assignLead,
  bulkUpdateLeads,
  createLead,
  exportLeadsCsv,
  getLeadById,
  listLeads,
  removeLead,
  updateLead,
  updateLeadStatus,
} from '../services/leadService.js';
import { leadActivitySchema, leadAssignSchema, leadBulkSchema, leadSchema, leadStatusSchema } from '../validations/leadValidation.js';

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

export async function getLeads(req, res, next) {
  try {
    const data = await listLeads(req.query);
    return res.json({ success: true, data: data.data, message: 'Leads loaded', pagination: data.pagination });
  } catch (error) {
    return next(error);
  }
}

export async function getLead(req, res, next) {
  try {
    const lead = await getLeadById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }
    return envelope(res, { lead }, 'Lead loaded');
  } catch (error) {
    return next(error);
  }
}

export async function createLeadController(req, res, next) {
  try {
    const value = validate(leadSchema, req.body);
    const lead = await createLead(value, req.user);
    return envelope(res, { lead }, 'Lead created');
  } catch (error) {
    return next(error);
  }
}

export async function updateLeadController(req, res, next) {
  try {
    const value = validate(leadSchema.fork(['source'], (schema) => schema.optional()).fork(['name', 'email', 'phone'], (schema) => schema.optional()), req.body);
    const lead = await updateLead(req.params.id, value, req.user);
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }
    return envelope(res, { lead }, 'Lead updated');
  } catch (error) {
    return next(error);
  }
}

export async function deleteLeadController(req, res, next) {
  try {
    const lead = await removeLead(req.params.id, req.user);
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }
    return envelope(res, { lead }, 'Lead deleted');
  } catch (error) {
    return next(error);
  }
}

export async function updateStatusController(req, res, next) {
  try {
    const { status } = validate(leadStatusSchema, req.body);
    const lead = await updateLeadStatus(req.params.id, status, req.user);
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }
    return envelope(res, { lead }, 'Lead status updated');
  } catch (error) {
    return next(error);
  }
}

export async function assignLeadController(req, res, next) {
  try {
    const { assignedTo } = validate(leadAssignSchema, req.body);
    const lead = await assignLead(req.params.id, assignedTo, req.user);
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }
    return envelope(res, { lead }, 'Lead assigned');
  } catch (error) {
    return next(error);
  }
}

export async function addActivityController(req, res, next) {
  try {
    const value = validate(leadActivitySchema, req.body);
    const lead = await addLeadActivity(req.params.id, value, req.user);
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }
    return envelope(res, { lead }, 'Activity logged');
  } catch (error) {
    return next(error);
  }
}

export async function bulkUpdateController(req, res, next) {
  try {
    const value = validate(leadBulkSchema, req.body);
    const update = {};
    if (value.assignedTo) update.assignedTo = value.assignedTo;
    if (value.status) update.status = value.status;
    await bulkUpdateLeads(value.ids, update, req.user);
    return envelope(res, null, 'Bulk update complete');
  } catch (error) {
    return next(error);
  }
}

export async function exportController(req, res, next) {
  try {
    const csv = await exportLeadsCsv(req.query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="leads.csv"');
    return res.send(csv);
  } catch (error) {
    return next(error);
  }
}
