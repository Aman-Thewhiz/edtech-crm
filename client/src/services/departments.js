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

export async function fetchDepartments(params = {}) {
  const { data } = await api.get(`/departments?${toSearchParams(params)}`);
  return data;
}

export async function fetchDepartment(id) {
  const { data } = await api.get(`/departments/${id}`);
  return data.data.department;
}

export async function createDepartment(payload) {
  const { data } = await api.post('/departments', payload);
  return data.data.department;
}

export async function updateDepartment(id, payload) {
  const { data } = await api.put(`/departments/${id}`, payload);
  return data.data.department;
}

export async function deleteDepartment(id) {
  const { data } = await api.delete(`/departments/${id}`);
  return data.data.department;
}

export async function fetchDepartmentStats() {
  const { data } = await api.get('/departments/stats/summary');
  return data.data;
}
