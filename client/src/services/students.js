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

export async function fetchStudents(params = {}) {
  const { data } = await api.get(`/students?${toSearchParams(params)}`);
  return data;
}

export async function fetchStudent(id) {
  const { data } = await api.get(`/students/${id}`);
  return data.data.student;
}

export async function createStudent(payload) {
  const { data } = await api.post('/students', payload);
  return data.data.student;
}

export async function updateStudent(id, payload) {
  const { data } = await api.put(`/students/${id}`, payload);
  return data.data.student;
}

export async function deleteStudent(id) {
  const { data } = await api.delete(`/students/${id}`);
  return data.data.student;
}

export async function updateStudentStatus(id, status) {
  const { data } = await api.patch(`/students/${id}/status`, { status });
  return data.data.student;
}

export async function uploadStudentDocument(id, payload) {
  const { data } = await api.post(`/students/${id}/documents`, payload);
  return data.data.student;
}

export async function downloadStudentIdCard(id) {
  const response = await api.get(`/students/${id}/id-card.pdf`, { responseType: 'blob' });
  return response.data;
}
