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



export async function createSalaryStructure(payload) {
  const { data } = await api.post('/payroll/salary-structures', payload);
  return data.data.structure;
}

export async function fetchSalaryStructures(params = {}) {
  const { data } = await api.get(`/payroll/salary-structures?${toSearchParams(params)}`);
  return data;
}

export async function fetchSalaryStructure(id) {
  const { data } = await api.get(`/payroll/salary-structures/${id}`);
  return data.data.structure;
}

export async function updateSalaryStructure(id, payload) {
  const { data } = await api.put(`/payroll/salary-structures/${id}`, payload);
  return data.data.structure;
}

export async function deleteSalaryStructure(id) {
  const { data } = await api.delete(`/payroll/salary-structures/${id}`);
  return data.data;
}



export async function generatePayroll(employeeId, payload) {
  const { data } = await api.post(`/payroll/employees/${employeeId}/payroll`, payload);
  return data.data.payroll;
}

export async function fetchPayrolls(params = {}) {
  const { data } = await api.get(`/payroll/payroll?${toSearchParams(params)}`);
  return data;
}

export async function fetchPayroll(id) {
  const { data } = await api.get(`/payroll/payroll/${id}`);
  return data.data.payroll;
}

export async function approvePayroll(id, payload) {
  const { data } = await api.post(`/payroll/payroll/${id}/approve`, payload);
  return data.data.payroll;
}

export async function processPayroll(id, payload) {
  const { data } = await api.post(`/payroll/payroll/${id}/process`, payload);
  return data.data.payroll;
}

export async function updatePayroll(id, payload) {
  const { data } = await api.put(`/payroll/payroll/${id}`, payload);
  return data.data.payroll;
}

export async function deletePayroll(id) {
  const { data } = await api.delete(`/payroll/payroll/${id}`);
  return data.data;
}



export async function createPayslip(payrollId) {
  const { data } = await api.post(`/payroll/payroll/${payrollId}/payslip`);
  return data.data.payslip;
}

export async function fetchPayslips(params = {}) {
  const { data } = await api.get(`/payroll/payslips?${toSearchParams(params)}`);
  return data;
}

export async function fetchPayslip(id) {
  const { data } = await api.get(`/payroll/payslips/${id}`);
  return data.data.payslip;
}

export async function markPayslipDownloaded(id) {
  const { data } = await api.post(`/payroll/payslips/${id}/mark-downloaded`);
  return data.data.payslip;
}
