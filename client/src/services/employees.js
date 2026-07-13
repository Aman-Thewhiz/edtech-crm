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

export async function fetchEmployees(params = {}) {
  const { data } = await api.get(`/employees?${toSearchParams(params)}`);
  return data;
}

export async function fetchEmployee(id) {
  const { data } = await api.get(`/employees/${id}`);
  return data.data.employee;
}

export async function createEmployee(payload) {
  const { data } = await api.post('/employees', payload);
  return data.data.employee;
}

export async function updateEmployee(id, payload) {
  const { data } = await api.put(`/employees/${id}`, payload);
  return data.data.employee;
}

export async function updateEmployeeStatus(id, status) {
  const { data } = await api.patch(`/employees/${id}/status`, { status });
  return data.data.employee;
}

export async function updateOnboardingChecklist(id, checklist) {
  const { data } = await api.patch(`/employees/${id}/checklist`, { checklist });
  return data.data.employee;
}

export async function uploadEmployeeDocument(id, payload) {
  const { data } = await api.post(`/employees/${id}/documents`, payload);
  return data.data.employee;
}

export async function deleteEmployee(id) {
  const { data } = await api.delete(`/employees/${id}`);
  return data.data.employee;
}

export async function fetchEmployeeStats() {
  const { data } = await api.get('/employees/stats/summary');
  return data.data;
}
