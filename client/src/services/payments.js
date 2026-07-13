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

export async function fetchPayments(params = {}) {
  const { data } = await api.get(`/payments?${toSearchParams(params)}`);
  return data;
}

export async function fetchPayment(id) {
  const { data } = await api.get(`/payments/${id}`);
  return data.data.payment;
}

export async function createPayment(payload) {
  const { data } = await api.post('/payments', payload);
  return data.data.payment;
}

export async function updatePayment(id, payload) {
  const { data } = await api.put(`/payments/${id}`, payload);
  return data.data.payment;
}

export async function reversePayment(id, reversalReason) {
  const { data } = await api.patch(`/payments/${id}/reverse`, { reversalReason });
  return data.data.payment;
}

export async function deletePayment(id) {
  const { data } = await api.delete(`/payments/${id}`);
  return data.data.payment;
}

export async function fetchPaymentStats() {
  const { data } = await api.get('/payments/stats/summary');
  return data.data;
}
