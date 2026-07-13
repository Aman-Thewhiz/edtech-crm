import api from './api';

export async function fetchLeads(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value);
    }
  });

  const { data } = await api.get(`/leads?${searchParams.toString()}`);
  return data;
}

export async function fetchLead(id) {
  const { data } = await api.get(`/leads/${id}`);
  return data.data.lead;
}

export async function createLead(payload) {
  const { data } = await api.post('/leads', payload);
  return data.data.lead;
}

export async function updateLead(id, payload) {
  const { data } = await api.put(`/leads/${id}`, payload);
  return data.data.lead;
}

export async function deleteLead(id) {
  const { data } = await api.delete(`/leads/${id}`);
  return data.data.lead;
}

export async function updateLeadStatus(id, status) {
  const { data } = await api.patch(`/leads/${id}/status`, { status });
  return data.data.lead;
}

export async function assignLead(id, assignedTo) {
  const { data } = await api.patch(`/leads/${id}/assign`, { assignedTo });
  return data.data.lead;
}

export async function addLeadActivity(id, payload) {
  const { data } = await api.post(`/leads/${id}/activities`, payload);
  return data.data.lead;
}

export async function bulkUpdateLeads(payload) {
  const { data } = await api.post('/leads/bulk', payload);
  return data;
}

export async function exportLeads(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value);
    }
  });

  const response = await api.get(`/leads/export?${searchParams.toString()}`, { responseType: 'blob' });
  return response.data;
}