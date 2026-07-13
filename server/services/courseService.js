import Batch from '../models/Batch.js';
import Course from '../models/Course.js';
import CourseCategory from '../models/CourseCategory.js';

function mapCourse(course) {
  return {
    id: course._id,
    name: course.name,
    description: course.description,
    duration: course.duration,
    fee: course.fee,
    category: course.category,
    status: course.status,
    createdBy: course.createdBy,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
  };
}

function mapBatch(batch) {
  return {
    id: batch._id,
    course: batch.course,
    name: batch.name,
    startDate: batch.startDate,
    endDate: batch.endDate,
    capacity: batch.capacity,
    schedule: batch.schedule,
    status: batch.status,
    enrollmentCount: batch.enrollmentCount,
    createdBy: batch.createdBy,
    createdAt: batch.createdAt,
    updatedAt: batch.updatedAt,
  };
}

function buildCourseFilter(query = {}) {
  const filter = { isDeleted: false };
  if (query.status) filter.status = query.status;
  if (query.category) filter.category = query.category;
  if (query.q) {
    const pattern = new RegExp(query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: pattern }, { description: pattern }, { duration: pattern }];
  }
  return filter;
}

function buildBatchFilter(query = {}) {
  const filter = { isDeleted: false };
  if (query.course) filter.course = query.course;
  if (query.status) filter.status = query.status;
  if (query.q) {
    const pattern = new RegExp(query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: pattern }, { schedule: pattern }];
  }
  return filter;
}

function buildSort(query = {}) {
  if (query.sort === 'oldest') return { createdAt: 1 };
  if (query.sort === 'name') return { name: 1 };
  return { createdAt: -1 };
}

export async function listCourses(query) {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 10), 1), 100);
  const filter = buildCourseFilter(query);
  const [items, total] = await Promise.all([
    Course.find(filter).sort(buildSort(query)).skip((page - 1) * limit).limit(limit).populate('category', 'name slug').populate('createdBy', 'name email role').lean(),
    Course.countDocuments(filter),
  ]);

  return {
    data: items.map(mapCourse),
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
  };
}

export async function getCourseById(id) {
  const course = await Course.findOne({ _id: id, isDeleted: false }).populate('category', 'name slug').populate('createdBy', 'name email role').lean();
  return course ? mapCourse(course) : null;
}

export async function createCourse(payload, user) {
  const course = await Course.create({ ...payload, createdBy: user.sub });
  await course.populate([
    { path: 'category', select: 'name slug' },
    { path: 'createdBy', select: 'name email role' },
  ]);
  return mapCourse(course);
}

export async function updateCourse(id, payload) {
  const course = await Course.findOneAndUpdate({ _id: id, isDeleted: false }, { $set: { ...payload } }, { new: true }).populate('category', 'name slug').populate('createdBy', 'name email role');
  return course ? mapCourse(course) : null;
}

export async function removeCourse(id) {
  const course = await Course.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true, deletedAt: new Date() }, { new: true });
  if (!course) return null;
  await Batch.updateMany({ course: id, isDeleted: false }, { isDeleted: true, deletedAt: new Date() });
  return mapCourse(course);
}

export async function listCourseCategories() {
  const categories = await CourseCategory.find({ isActive: true }).sort({ name: 1 }).lean();
  return categories.map((category) => ({ id: category._id, name: category.name, slug: category.slug }));
}

export async function listBatches(query) {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 10), 1), 100);
  const filter = buildBatchFilter(query);
  const [items, total] = await Promise.all([
    Batch.find(filter).sort(buildSort(query)).skip((page - 1) * limit).limit(limit).populate('course', 'name status category').populate('createdBy', 'name email role').lean(),
    Batch.countDocuments(filter),
  ]);

  return {
    data: items.map(mapBatch),
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
  };
}

export async function getBatchById(id) {
  const batch = await Batch.findOne({ _id: id, isDeleted: false }).populate('course', 'name status category').populate('createdBy', 'name email role').lean();
  return batch ? mapBatch(batch) : null;
}

export async function createBatch(payload, user) {
  const batch = await Batch.create({ ...payload, createdBy: user.sub });
  await batch.populate([
    { path: 'course', select: 'name status category' },
    { path: 'createdBy', select: 'name email role' },
  ]);
  return mapBatch(batch);
}

export async function updateBatch(id, payload) {
  const batch = await Batch.findOneAndUpdate({ _id: id, isDeleted: false }, { $set: { ...payload } }, { new: true }).populate('course', 'name status category').populate('createdBy', 'name email role');
  return batch ? mapBatch(batch) : null;
}

export async function removeBatch(id) {
  const batch = await Batch.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true, deletedAt: new Date() }, { new: true });
  return batch ? mapBatch(batch) : null;
}

export async function updateBatchStatus(id, status) {
  const batch = await Batch.findOneAndUpdate({ _id: id, isDeleted: false }, { $set: { status } }, { new: true }).populate('course', 'name status category').populate('createdBy', 'name email role');
  return batch ? mapBatch(batch) : null;
}
