import Admission from '../models/Admission.js';
import Batch from '../models/Batch.js';
import Course from '../models/Course.js';
import Lead from '../models/Lead.js';
import Student from '../models/Student.js';
import { createStudent } from './studentService.js';
import { notifyAdmissionStatusChange } from './notificationService.js';

const defaultChecklist = [
  { name: 'Application form', required: true },
  { name: 'ID proof', required: true },
  { name: 'Photo', required: true },
  { name: 'Previous certificates', required: true },
  { name: 'Fee confirmation', required: true },
];

const allowedTransitions = {
  initiated: ['documents-pending'],
  'documents-pending': ['documents-verified'],
  'documents-verified': ['fee-pending'],
  'fee-pending': ['enrolled'],
  enrolled: [],
};

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function fullName(admission) {
  return `${admission.firstName} ${admission.lastName}`.trim();
}

function mapAdmission(admission) {
  return {
    id: admission._id,
    lead: admission.lead,
    student: admission.student,
    course: admission.course,
    batch: admission.batch,
    firstName: admission.firstName,
    lastName: admission.lastName,
    name: fullName(admission),
    email: admission.email,
    phone: admission.phone,
    dateOfBirth: admission.dateOfBirth,
    gender: admission.gender,
    address: admission.address,
    guardianName: admission.guardianName,
    guardianPhone: admission.guardianPhone,
    status: admission.status,
    documentChecklist: admission.documentChecklist,
    statusHistory: admission.statusHistory,
    invoiceStub: admission.invoiceStub,
    enrolledAt: admission.enrolledAt,
    createdBy: admission.createdBy,
    createdAt: admission.createdAt,
    updatedAt: admission.updatedAt,
  };
}

function buildFilter(query = {}) {
  const filter = { isDeleted: false };
  if (query.status) filter.status = query.status;
  if (query.course) filter.course = query.course;
  if (query.batch) filter.batch = query.batch;
  if (query.lead) filter.lead = query.lead;
  if (query.q) {
    const pattern = new RegExp(escapeRegex(query.q), 'i');
    filter.$or = [
      { firstName: pattern },
      { lastName: pattern },
      { email: pattern },
      { phone: pattern },
    ];
  }
  return filter;
}

function buildSort(query = {}) {
  if (query.sort === 'oldest') return { createdAt: 1 };
  if (query.sort === 'name') return { firstName: 1, lastName: 1 };
  return { createdAt: -1 };
}

function populateAdmission(query) {
  return query
    .populate('lead', 'name email phone status convertedToAdmission source')
    .populate('student', 'enrollmentNumber firstName lastName email phone status')
    .populate('course', 'name status duration fee')
    .populate('batch', 'name status startDate endDate capacity schedule enrollmentCount')
    .populate('createdBy', 'name email role')
    .populate('statusHistory.changedBy', 'name email role');
}

function createWorkflowError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function buildInvoiceStub(admission) {
  if (admission.invoiceStub?.status === 'draft') return admission.invoiceStub;
  return {
    invoiceNumber: `ADM-STUB-${new Date().getFullYear()}-${String(admission._id).slice(-6).toUpperCase()}`,
    amount: admission.course?.fee || 0,
    status: 'draft',
    generatedAt: new Date(),
    note: 'Admission invoice stub. Full invoice generation belongs to Phase 7.',
  };
}

export async function listAdmissions(query) {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 10), 1), 100);
  const filter = buildFilter(query);
  const [items, total] = await Promise.all([
    populateAdmission(Admission.find(filter).sort(buildSort(query)).skip((page - 1) * limit).limit(limit)).lean(),
    Admission.countDocuments(filter),
  ]);
  return {
    data: items.map(mapAdmission),
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
  };
}

export async function getAdmissionById(id) {
  const admission = await populateAdmission(Admission.findOne({ _id: id, isDeleted: false }));
  return admission ? mapAdmission(admission) : null;
}

export async function createAdmission(payload, user) {
  const [lead, course, batch, duplicate] = await Promise.all([
    Lead.findOne({ _id: payload.lead, isDeleted: false }),
    Course.findOne({ _id: payload.course, isDeleted: false }),
    Batch.findOne({ _id: payload.batch, course: payload.course, isDeleted: false }),
    Admission.findOne({ lead: payload.lead, isDeleted: false }),
  ]);

  if (!lead) throw createWorkflowError('Lead not found', 404);
  if (!course) throw createWorkflowError('Course not found', 404);
  if (!batch) throw createWorkflowError('Batch not found for selected course', 404);
  if (lead.convertedToAdmission || duplicate) throw createWorkflowError('Lead has already been converted to admission');

  const admission = await Admission.create({
    ...payload,
    documentChecklist: payload.documentChecklist?.length ? payload.documentChecklist : defaultChecklist,
    status: 'initiated',
    statusHistory: [{ status: 'initiated', changedBy: user.sub, note: 'Admission initiated' }],
    invoiceStub: { status: 'not-generated', amount: course.fee || 0 },
    createdBy: user.sub,
  });

  lead.convertedToAdmission = true;
  lead.status = 'won';
  lead.activities.push({
    type: 'note',
    summary: 'Lead converted to admission',
    completedAt: new Date(),
    createdBy: user.sub,
  });
  await lead.save();

  return mapAdmission(await populateAdmission(Admission.findById(admission._id)));
}

export async function updateAdmission(id, payload) {
  const admission = await Admission.findOne({ _id: id, isDeleted: false });
  if (!admission) return null;
  if (admission.status === 'enrolled') throw createWorkflowError('Enrolled admissions cannot be edited');

  const [course, batch] = await Promise.all([
    Course.findOne({ _id: payload.course, isDeleted: false }),
    Batch.findOne({ _id: payload.batch, course: payload.course, isDeleted: false }),
  ]);
  if (!course) throw createWorkflowError('Course not found', 404);
  if (!batch) throw createWorkflowError('Batch not found for selected course', 404);

  Object.assign(admission, {
    course: payload.course,
    batch: payload.batch,
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    phone: payload.phone,
    dateOfBirth: payload.dateOfBirth || null,
    gender: payload.gender || 'prefer-not-to-say',
    address: payload.address || '',
    guardianName: payload.guardianName || '',
    guardianPhone: payload.guardianPhone || '',
    documentChecklist: payload.documentChecklist?.length ? payload.documentChecklist : admission.documentChecklist,
  });
  await admission.save();
  return mapAdmission(await populateAdmission(Admission.findById(id)));
}

export async function removeAdmission(id) {
  const admission = await Admission.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true, deletedAt: new Date() },
    { new: true },
  );
  if (!admission) return null;
  if (admission.lead && admission.status !== 'enrolled') {
    await Lead.findByIdAndUpdate(admission.lead, { convertedToAdmission: false });
  }
  return mapAdmission(admission);
}

export async function updateAdmissionChecklist(id, documentChecklist) {
  const admission = await Admission.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { documentChecklist },
    { new: true },
  );
  return admission ? mapAdmission(await populateAdmission(Admission.findById(id))) : null;
}

async function enrollAdmission(admission, user) {
  const existingStudent = admission.student ? await Student.findById(admission.student) : null;
  if (existingStudent) return existingStudent;
  return createStudent({
    firstName: admission.firstName,
    lastName: admission.lastName,
    email: admission.email,
    phone: admission.phone,
    dateOfBirth: admission.dateOfBirth,
    gender: admission.gender,
    address: admission.address,
    guardianName: admission.guardianName,
    guardianPhone: admission.guardianPhone,
    course: admission.course._id || admission.course,
    batch: admission.batch._id || admission.batch,
    admission: admission._id,
    status: 'active',
    enrollmentDate: new Date(),
  }, user);
}

export async function transitionAdmissionStatus(id, status, note, user) {
  const admission = await populateAdmission(Admission.findOne({ _id: id, isDeleted: false }));
  if (!admission) return null;
  if (admission.status === status) return mapAdmission(admission);

  const allowed = allowedTransitions[admission.status] || [];
  if (!allowed.includes(status)) {
    throw createWorkflowError(`Invalid status transition from ${admission.status} to ${status}`);
  }

  if (status === 'documents-verified') {
    const missing = admission.documentChecklist.filter((item) => item.required && (!item.received || !item.verified));
    if (missing.length) throw createWorkflowError('Required documents must be received and verified first');
  }

  if (status === 'fee-pending') {
    admission.invoiceStub = buildInvoiceStub(admission);
  }

  if (status === 'enrolled') {
    if (admission.invoiceStub?.status !== 'draft') {
      admission.invoiceStub = buildInvoiceStub(admission);
    }
    const student = await enrollAdmission(admission, user);
    admission.student = student.id;
    admission.enrolledAt = new Date();
  }

  admission.status = status;
  admission.statusHistory.push({ status, changedBy: user.sub, note: note || '' });
  await admission.save();

  // Notify student/user about status change
  // Note: For simplicity, we use the admission's student field or lead info
  // In a real scenario, we'd notify the specific user account associated with the student
  if (admission.student || admission.lead) {
    const recipientId = admission.student?._id || admission.student || admission.lead?._id || admission.lead;
    await notifyAdmissionStatusChange(admission._id, recipientId, status);
  }

  return mapAdmission(await populateAdmission(Admission.findById(id)));
}
