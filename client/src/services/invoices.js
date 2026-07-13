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

export async function fetchInvoices(params = {}) {
  const { data } = await api.get(`/invoices?${toSearchParams(params)}`);
  return data;
}

export async function fetchInvoice(id) {
  const { data } = await api.get(`/invoices/${id}`);
  return data.data.invoice;
}

export async function createInvoice(payload) {
  const { data } = await api.post('/invoices', payload);
  return data.data.invoice;
}

export async function updateInvoice(id, payload) {
  const { data } = await api.put(`/invoices/${id}`, payload);
  return data.data.invoice;
}

export async function deleteInvoice(id) {
  const { data } = await api.delete(`/invoices/${id}`);
  return data.data.invoice;
}

export async function updateInvoiceStatus(id, status) {
  const { data } = await api.patch(`/invoices/${id}/status`, { status });
  return data.data.invoice;
}

export async function downloadInvoicePdf(id) {
  const response = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
  return response.data;
}

export async function fetchInvoiceStats() {
  const { data } = await api.get('/invoices/stats/summary');
  return data.data;
}
