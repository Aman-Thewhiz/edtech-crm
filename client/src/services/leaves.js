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

// ============ LEAVE POLICY ENDPOINTS ============

export async function createLeavePolicy(payload) {
  const { data } = await api.post('/leaves/policies', payload);
  return data.data.policy;
}

export async function fetchLeavePolicies(params = {}) {
  const { data } = await api.get(`/leaves/policies?${toSearchParams(params)}`);
  return data;
}

export async function fetchLeavePolicy(id) {
  const { data } = await api.get(`/leaves/policies/${id}`);
  return data.data.policy;
}

export async function updateLeavePolicy(id, payload) {
  const { data } = await api.put(`/leaves/policies/${id}`, payload);
  return data.data.policy;
}

export async function deleteLeavePolicy(id) {
  const { data } = await api.delete(`/leaves/policies/${id}`);
  return data.data;
}

// ============ LEAVE REQUEST ENDPOINTS ============

export async function createLeaveRequest(payload) {
  const { data } = await api.post('/leaves/requests', payload);
  return data.data.request;
}

export async function fetchLeaveRequests(params = {}) {
  const { data } = await api.get(`/leaves/requests?${toSearchParams(params)}`);
  return data;
}

export async function fetchLeaveRequest(id) {
  const { data } = await api.get(`/leaves/requests/${id}`);
  return data.data.request;
}

export async function approveLeaveRequest(id, payload) {
  const { data } = await api.post(`/leaves/requests/${id}/approve`, payload);
  return data.data.request;
}

export async function cancelLeaveRequest(id, payload) {
  const { data } = await api.post(`/leaves/requests/${id}/cancel`, payload);
  return data.data.request;
}

// ============ LEAVE BALANCE ENDPOINTS ============

export async function fetchLeaveBalances(params = {}) {
  const { data } = await api.get(`/leaves/balances?${toSearchParams(params)}`);
  return data;
}

export async function fetchEmployeeLeaveBalances(employeeId, financialYear) {
  const { data } = await api.get(
    `/leaves/balances/employee/${employeeId}?financialYear=${financialYear}`
  );
  return data.data.balances;
}

export async function fetchLeaveBalance(employeeId, policyId, financialYear) {
  const { data } = await api.get(
    `/leaves/balances/employee/${employeeId}/policy/${policyId}?financialYear=${financialYear}`
  );
  return data.data.balance;
}

export async function createLeaveBalance(payload) {
  const { data } = await api.post('/leaves/balances', payload);
  return data.data.balance;
}

export async function updateLeaveBalance(id, payload) {
  const { data } = await api.put(`/leaves/balances/${id}`, payload);
  return data.data.balance;
}
