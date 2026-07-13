import fs from 'node:fs/promises';
import path from 'node:path';
import Batch from '../models/Batch.js';
import Student from '../models/Student.js';

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function fullName(student) {
  return `${student.firstName} ${student.lastName}`.trim();
}

function mapStudent(student) {
  return {
    id: student._id,
    enrollmentNumber: student.enrollmentNumber,
    firstName: student.firstName,
    lastName: student.lastName,
    name: fullName(student),
    email: student.email,
    phone: student.phone,
    dateOfBirth: student.dateOfBirth,
    gender: student.gender,
    address: student.address,
    guardianName: student.guardianName,
    guardianPhone: student.guardianPhone,
    course: student.course,
    batch: student.batch,
    admission: student.admission,
    status: student.status,
    enrollmentDate: student.enrollmentDate,
    documents: student.documents,
    createdBy: student.createdBy,
    createdAt: student.createdAt,
    updatedAt: student.updatedAt,
  };
}

function buildFilter(query = {}) {
  const filter = { isDeleted: false };
  if (query.course) filter.course = query.course;
  if (query.batch) filter.batch = query.batch;
  if (query.status) filter.status = query.status;
  if (query.enrollmentYear) {
    const year = Number(query.enrollmentYear);
    if (!Number.isNaN(year)) {
      filter.enrollmentDate = {
        $gte: new Date(Date.UTC(year, 0, 1)),
        $lt: new Date(Date.UTC(year + 1, 0, 1)),
      };
    }
  }
  if (query.q) {
    const pattern = new RegExp(escapeRegex(query.q), 'i');
    filter.$or = [
      { firstName: pattern },
      { lastName: pattern },
      { enrollmentNumber: pattern },
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

async function generateEnrollmentNumber(enrollmentDate = new Date()) {
  const year = new Date(enrollmentDate).getFullYear();
  const prefix = `EDU-${year}-`;
  const latest = await Student.findOne({ enrollmentNumber: new RegExp(`^${prefix}`) })
    .sort({ enrollmentNumber: -1 })
    .select('enrollmentNumber')
    .lean();
  const currentSequence = latest ? Number(latest.enrollmentNumber.replace(prefix, '')) : 0;
  return `${prefix}${String(currentSequence + 1).padStart(5, '0')}`;
}

async function recalculateBatchEnrollment(batchId) {
  if (!batchId) return;
  const enrollmentCount = await Student.countDocuments({ batch: batchId, status: 'active', isDeleted: false });
  await Batch.findByIdAndUpdate(batchId, { enrollmentCount });
}

function populateStudent(query) {
  return query
    .populate('course', 'name status duration fee')
    .populate('batch', 'name status startDate endDate capacity schedule enrollmentCount')
    .populate('createdBy', 'name email role');
}

export async function listStudents(query) {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 10), 1), 100);
  const filter = buildFilter(query);
  const [items, total] = await Promise.all([
    populateStudent(Student.find(filter).sort(buildSort(query)).skip((page - 1) * limit).limit(limit)).lean(),
    Student.countDocuments(filter),
  ]);

  return {
    data: items.map(mapStudent),
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
  };
}

export async function getStudentById(id) {
  const student = await populateStudent(Student.findOne({ _id: id, isDeleted: false }));
  return student ? mapStudent(student) : null;
}

export async function createStudent(payload, user) {
  const enrollmentDate = payload.enrollmentDate || new Date();
  const student = await Student.create({
    ...payload,
    admission: payload.admission || null,
    enrollmentDate,
    enrollmentNumber: await generateEnrollmentNumber(enrollmentDate),
    createdBy: user.sub,
  });
  await recalculateBatchEnrollment(student.batch);
  return mapStudent(await populateStudent(Student.findById(student._id)));
}

export async function updateStudent(id, payload) {
  const existing = await Student.findOne({ _id: id, isDeleted: false });
  if (!existing) return null;
  const previousBatch = existing.batch;
  Object.assign(existing, { ...payload, admission: payload.admission || null });
  await existing.save();
  await recalculateBatchEnrollment(previousBatch);
  await recalculateBatchEnrollment(existing.batch);
  return mapStudent(await populateStudent(Student.findById(existing._id)));
}

export async function updateStudentStatus(id, status) {
  const student = await Student.findOneAndUpdate({ _id: id, isDeleted: false }, { status }, { new: true });
  if (!student) return null;
  await recalculateBatchEnrollment(student.batch);
  return mapStudent(await populateStudent(Student.findById(student._id)));
}

export async function removeStudent(id) {
  const student = await Student.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true, deletedAt: new Date() },
    { new: true },
  );
  if (!student) return null;
  await recalculateBatchEnrollment(student.batch);
  return mapStudent(student);
}

export async function uploadStudentDocument(id, payload, user) {
  const student = await Student.findOne({ _id: id, isDeleted: false });
  if (!student) return null;
  const safeFileName = `${Date.now()}-${payload.fileName.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
  const uploadDir = path.resolve('server/uploads/students', String(id));
  await fs.mkdir(uploadDir, { recursive: true });
  const rawBase64 = payload.contentBase64.includes(',') ? payload.contentBase64.split(',').pop() : payload.contentBase64;
  await fs.writeFile(path.join(uploadDir, safeFileName), Buffer.from(rawBase64, 'base64'));

  student.documents.push({
    type: payload.type,
    name: payload.name,
    fileName: safeFileName,
    mimeType: payload.mimeType || '',
    url: `/uploads/students/${id}/${safeFileName}`,
    uploadedBy: user.sub,
  });
  await student.save();
  return mapStudent(await populateStudent(Student.findById(student._id)));
}

function escapePdfText(value) {
  return String(value ?? '').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

export function createStudentIdCardPdf(student) {
  const lines = [
    'EduFlow CRM Student ID',
    `Name: ${student.name}`,
    `Enrollment: ${student.enrollmentNumber}`,
    `Course: ${student.course?.name || '-'}`,
    `Batch: ${student.batch?.name || '-'}`,
    `Phone: ${student.phone}`,
    `Status: ${student.status}`,
  ];
  const textCommands = lines.map((line, index) => `50 ${760 - index * 28} Td (${escapePdfText(line)}) Tj`).join('\n');
  const content = `BT\n/F1 16 Tf\n${textCommands}\nET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 420 595] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf);
}
