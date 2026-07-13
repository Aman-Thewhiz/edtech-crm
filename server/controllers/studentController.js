import {
  createStudent,
  createStudentIdCardPdf,
  getStudentById,
  listStudents,
  removeStudent,
  updateStudent,
  updateStudentStatus,
  uploadStudentDocument,
} from '../services/studentService.js';
import { studentDocumentSchema, studentSchema, studentStatusSchema } from '../validations/studentValidation.js';

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

export async function getStudents(req, res, next) {
  try {
    const data = await listStudents(req.query);
    return res.json({ success: true, data: data.data, message: 'Students loaded', pagination: data.pagination });
  } catch (error) {
    return next(error);
  }
}

export async function getStudent(req, res, next) {
  try {
    const student = await getStudentById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    return envelope(res, { student }, 'Student loaded');
  } catch (error) {
    return next(error);
  }
}

export async function createStudentController(req, res, next) {
  try {
    const value = validate(studentSchema, req.body);
    const student = await createStudent(value, req.user);
    return envelope(res, { student }, 'Student created');
  } catch (error) {
    return next(error);
  }
}

export async function updateStudentController(req, res, next) {
  try {
    const schema = studentSchema.fork(['firstName', 'lastName', 'email', 'phone', 'course', 'batch'], (field) => field.optional());
    const value = validate(schema, req.body);
    const student = await updateStudent(req.params.id, value);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    return envelope(res, { student }, 'Student updated');
  } catch (error) {
    return next(error);
  }
}

export async function deleteStudentController(req, res, next) {
  try {
    const student = await removeStudent(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    return envelope(res, { student }, 'Student deleted');
  } catch (error) {
    return next(error);
  }
}

export async function updateStudentStatusController(req, res, next) {
  try {
    const { status } = validate(studentStatusSchema, req.body);
    const student = await updateStudentStatus(req.params.id, status);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    return envelope(res, { student }, 'Student status updated');
  } catch (error) {
    return next(error);
  }
}

export async function uploadStudentDocumentController(req, res, next) {
  try {
    const value = validate(studentDocumentSchema, req.body);
    const student = await uploadStudentDocument(req.params.id, value, req.user);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    return envelope(res, { student }, 'Document uploaded');
  } catch (error) {
    return next(error);
  }
}

export async function getStudentIdCardController(req, res, next) {
  try {
    const student = await getStudentById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    const pdf = createStudentIdCardPdf(student);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${student.enrollmentNumber}.pdf"`);
    return res.send(pdf);
  } catch (error) {
    return next(error);
  }
}
