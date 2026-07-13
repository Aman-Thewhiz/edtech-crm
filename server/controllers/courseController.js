import {
  createBatch,
  createCourse,
  getBatchById,
  getCourseById,
  listBatches,
  listCourseCategories,
  listCourses,
  removeBatch,
  removeCourse,
  updateBatch,
  updateBatchStatus,
  updateCourse,
} from '../services/courseService.js';
import { batchSchema, batchStatusSchema, courseSchema } from '../validations/courseValidation.js';

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

export async function getCourses(req, res, next) {
  try {
    const data = await listCourses(req.query);
    return res.json({ success: true, data: data.data, message: 'Courses loaded', pagination: data.pagination });
  } catch (error) {
    return next(error);
  }
}

export async function getCourse(req, res, next) {
  try {
    const course = await getCourseById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }
    return envelope(res, { course }, 'Course loaded');
  } catch (error) {
    return next(error);
  }
}

export async function createCourseController(req, res, next) {
  try {
    const value = validate(courseSchema, req.body);
    const course = await createCourse(value, req.user);
    return envelope(res, { course }, 'Course created');
  } catch (error) {
    return next(error);
  }
}

export async function updateCourseController(req, res, next) {
  try {
    const schema = courseSchema.fork(['name', 'duration', 'fee', 'category'], (field) => field.optional());
    const value = validate(schema, req.body);
    const course = await updateCourse(req.params.id, value);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }
    return envelope(res, { course }, 'Course updated');
  } catch (error) {
    return next(error);
  }
}

export async function deleteCourseController(req, res, next) {
  try {
    const course = await removeCourse(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }
    return envelope(res, { course }, 'Course deleted');
  } catch (error) {
    return next(error);
  }
}

export async function getCourseCategoriesController(_req, res, next) {
  try {
    const categories = await listCourseCategories();
    return envelope(res, { categories }, 'Categories loaded');
  } catch (error) {
    return next(error);
  }
}

export async function getBatches(req, res, next) {
  try {
    const data = await listBatches(req.query);
    return res.json({ success: true, data: data.data, message: 'Batches loaded', pagination: data.pagination });
  } catch (error) {
    return next(error);
  }
}

export async function getBatch(req, res, next) {
  try {
    const batch = await getBatchById(req.params.id);
    if (!batch) {
      return res.status(404).json({ success: false, error: 'Batch not found' });
    }
    return envelope(res, { batch }, 'Batch loaded');
  } catch (error) {
    return next(error);
  }
}

export async function createBatchController(req, res, next) {
  try {
    const value = validate(batchSchema, req.body);
    const batch = await createBatch(value, req.user);
    return envelope(res, { batch }, 'Batch created');
  } catch (error) {
    return next(error);
  }
}

export async function updateBatchController(req, res, next) {
  try {
    const schema = batchSchema.fork(['course', 'name', 'startDate', 'endDate', 'capacity', 'schedule'], (field) => field.optional());
    const value = validate(schema, req.body);
    const batch = await updateBatch(req.params.id, value);
    if (!batch) {
      return res.status(404).json({ success: false, error: 'Batch not found' });
    }
    return envelope(res, { batch }, 'Batch updated');
  } catch (error) {
    return next(error);
  }
}

export async function deleteBatchController(req, res, next) {
  try {
    const batch = await removeBatch(req.params.id);
    if (!batch) {
      return res.status(404).json({ success: false, error: 'Batch not found' });
    }
    return envelope(res, { batch }, 'Batch deleted');
  } catch (error) {
    return next(error);
  }
}

export async function updateBatchStatusController(req, res, next) {
  try {
    const { status } = validate(batchStatusSchema, req.body);
    const batch = await updateBatchStatus(req.params.id, status);
    if (!batch) {
      return res.status(404).json({ success: false, error: 'Batch not found' });
    }
    return envelope(res, { batch }, 'Batch status updated');
  } catch (error) {
    return next(error);
  }
}