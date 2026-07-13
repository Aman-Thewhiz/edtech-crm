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

export async function fetchAdmissions(params = {}) {
  const { data } = await api.get(`/admissions?${toSearchParams(params)}`);
  return data;
}

export async function fetchAdmission(id) {
  const { data } = await api.get(`/admissions/${id}`);
  return data.data.admission;
}

export async function createAdmission(payload) {
  const { data } = await api.post('/admissions', payload);
  return data.data.admission;
}

export async function updateAdmission(id, payload) {
  const { data } = await api.put(`/admissions/${id}`, payload);
  return data.data.admission;
}

export async function deleteAdmission(id) {
  const { data } = await api.delete(`/admissions/${id}`);
  return data.data.admission;
}

export async function updateAdmissionStatus(id, status, note = '') {
  const { data } = await api.patch(`/admissions/${id}/status`, { status, note });
  return data.data.admission;
}

export async function updateAdmissionChecklist(id, documentChecklist) {
  const { data } = await api.patch(`/admissions/${id}/checklist`, { documentChecklist });
  return data.data.admission;
}
