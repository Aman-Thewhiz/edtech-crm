import Lead from '../models/Lead.js';
import { invalidateDashboardCache } from './dashboardService.js';
import { notifyLeadAssignment } from './notificationService.js';

function escapeCsv(value) {
  return String(value ?? '').replace(/"/g, '""');
}

function buildFilter(query = {}) {
  const filter = { isDeleted: false };

  if (query.status) filter.status = query.status;
  if (query.source) filter.source = query.source;
  if (query.assignedTo) filter.assignedTo = query.assignedTo;
  if (query.from || query.to) {
    filter.createdAt = {};
    if (query.from) filter.createdAt.$gte = new Date(query.from);
    if (query.to) filter.createdAt.$lte = new Date(query.to);
  }
  if (query.q) {
    filter.$text = { $search: query.q };
  }

  return filter;
}

function buildSort(query = {}) {
  if (query.sort === 'oldest') return { createdAt: 1 };
  if (query.sort === 'name') return { name: 1 };
  return { createdAt: -1 };
}

function mapLead(lead) {
  return {
    id: lead._id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    alternatePhone: lead.alternatePhone,
    status: lead.status,
    source: lead.source,
    assignedTo: lead.assignedTo,
    createdBy: lead.createdBy,
    leadScore: lead.leadScore,
    followUpAt: lead.followUpAt,
    activities: lead.activities,
    notes: lead.notes,
    documents: lead.documents,
    convertedToAdmission: lead.convertedToAdmission,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
  };
}

export async function listLeads(query) {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 10), 1), 100);
  const filter = buildFilter(query);
  const sort = buildSort(query);

  const [items, total] = await Promise.all([
    Lead.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).populate('assignedTo', 'name email role').populate('createdBy', 'name email role').lean(),
    Lead.countDocuments(filter),
  ]);

  return {
    data: items.map(mapLead),
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
  };
}

export async function getLeadById(id) {
  const lead = await Lead.findOne({ _id: id, isDeleted: false }).populate('assignedTo', 'name email role').populate('createdBy', 'name email role');
  return lead ? mapLead(lead) : null;
}

export async function createLead(payload, user) {
  const lead = await Lead.create({
    ...payload,
    assignedTo: payload.assignedTo || null,
    leadScore: payload.leadScore || 3,
    createdBy: user.sub,
    notes: payload.notes ? [{ body: payload.notes, createdBy: user.sub }] : [],
    documents: Array.isArray(payload.documents)
      ? payload.documents.map((document) => ({ ...document, uploadedBy: user.sub }))
      : [],
  });

  await invalidateDashboardCache(user.sub);
  return mapLead(lead);
}

export async function updateLead(id, payload, user) {
  const update = { $set: { ...payload } };
  delete update.$set.notes;
  delete update.$set.documents;
  if (payload.notes) {
    update.$push = { notes: { body: payload.notes, createdBy: user.sub } };
  }

  if (Array.isArray(payload.documents)) {
    update.$set.documents = payload.documents.map((document) => ({ ...document, uploadedBy: user.sub }));
  }

  const lead = await Lead.findOneAndUpdate(
    { _id: id, isDeleted: false },
    update,
    { new: true },
  ).populate('assignedTo', 'name email role').populate('createdBy', 'name email role');

  await invalidateDashboardCache(user.sub);
  return lead ? mapLead(lead) : null;
}

export async function removeLead(id, user) {
  const lead = await Lead.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true, deletedAt: new Date() },
    { new: true },
  );

  await invalidateDashboardCache(user.sub);
  return lead ? mapLead(lead) : null;
}

export async function updateLeadStatus(id, status, user) {
  const lead = await Lead.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { status },
    { new: true },
  ).populate('assignedTo', 'name email role').populate('createdBy', 'name email role');

  await invalidateDashboardCache(user.sub);
  return lead ? mapLead(lead) : null;
}

export async function assignLead(id, assignedTo, user) {
  const lead = await Lead.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { assignedTo },
    { new: true },
  ).populate('assignedTo', 'name email role').populate('createdBy', 'name email role');

  await invalidateDashboardCache(user.sub);

  if (lead && assignedTo) {
    await notifyLeadAssignment(lead._id, assignedTo, user);
  }

  return lead ? mapLead(lead) : null;
}

export async function addLeadActivity(id, payload, user) {
  const lead = await Lead.findOneAndUpdate(
    { _id: id, isDeleted: false },
    {
      $push: {
        activities: {
          type: payload.type,
          summary: payload.summary,
          scheduledAt: payload.scheduledAt || null,
          completedAt: new Date(),
          createdBy: user.sub,
        },
      },
    },
    { new: true },
  ).populate('assignedTo', 'name email role').populate('createdBy', 'name email role');

  await invalidateDashboardCache(user.sub);
  return lead ? mapLead(lead) : null;
}

export async function bulkUpdateLeads(ids, update, user) {
  const result = await Lead.updateMany({ _id: { $in: ids }, isDeleted: false }, update);
  await invalidateDashboardCache(user.sub);
  return result;
}

export async function exportLeadsCsv(query) {
  const filter = buildFilter(query);
  const leads = await Lead.find(filter).sort(buildSort(query)).populate('assignedTo', 'name email role').lean();
  const rows = [
    ['Name', 'Email', 'Phone', 'Status', 'Source', 'Assigned To', 'Score', 'Follow Up At'].join(',')
  ];

  leads.forEach((lead) => {
    rows.push([
      escapeCsv(lead.name),
      escapeCsv(lead.email),
      escapeCsv(lead.phone),
      escapeCsv(lead.status),
      escapeCsv(lead.source),
      escapeCsv(lead.assignedTo?.name || ''),
      escapeCsv(lead.leadScore),
      escapeCsv(lead.followUpAt || ''),
    ].map((cell) => `"${cell}"`).join(','));
  });

  return rows.join('\n');
}
