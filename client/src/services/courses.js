import api from './api';

function toSearchParams(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value);
    }
  });
  return searchParams.toString();
}

export async function fetchCourses(params = {}) {
  const { data } = await api.get(`/courses?${toSearchParams(params)}`);
  return data;
}

export async function fetchCourse(id) {
  const { data } = await api.get(`/courses/${id}`);
  return data.data.course;
}

export async function createCourse(payload) {
  const { data } = await api.post('/courses', payload);
  return data.data.course;
}

export async function updateCourse(id, payload) {
  const { data } = await api.put(`/courses/${id}`, payload);
  return data.data.course;
}

export async function deleteCourse(id) {
  const { data } = await api.delete(`/courses/${id}`);
  return data.data.course;
}

export async function fetchCourseCategories() {
  const { data } = await api.get('/courses/categories');
  return data.data.categories;
}

export async function fetchBatches(params = {}) {
  const { data } = await api.get(`/batches?${toSearchParams(params)}`);
  return data;
}

export async function fetchBatch(id) {
  const { data } = await api.get(`/batches/${id}`);
  return data.data.batch;
}

export async function createBatch(payload) {
  const { data } = await api.post('/batches', payload);
  return data.data.batch;
}

export async function updateBatch(id, payload) {
  const { data } = await api.put(`/batches/${id}`, payload);
  return data.data.batch;
}

export async function deleteBatch(id) {
  const { data } = await api.delete(`/batches/${id}`);
  return data.data.batch;
}

export async function updateBatchStatus(id, status) {
  const { data } = await api.patch(`/batches/${id}/status`, { status });
  return data.data.batch;
}