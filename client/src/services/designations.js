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

export async function fetchDesignations(params = {}) {
  const { data } = await api.get(`/designations?${toSearchParams(params)}`);
  return data;
}

export async function fetchDesignation(id) {
  const { data } = await api.get(`/designations/${id}`);
  return data.data.designation;
}

export async function createDesignation(payload) {
  const { data } = await api.post('/designations', payload);
  return data.data.designation;
}

export async function updateDesignation(id, payload) {
  const { data } = await api.put(`/designations/${id}`, payload);
  return data.data.designation;
}

export async function deleteDesignation(id) {
  const { data } = await api.delete(`/designations/${id}`);
  return data.data.designation;
}

export async function fetchDesignationStats() {
  const { data } = await api.get('/designations/stats/summary');
  return data.data;
}
