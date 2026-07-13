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

// ============ REPORT ENDPOINTS ============

export async function fetchLeadConversionReport(params = {}) {
  const { data } = await api.get(`/reports/lead-conversion?${toSearchParams(params)}`);
  return data.data.report;
}

export async function fetchAdmissionsTrendReport(params = {}) {
  const { data } = await api.get(`/reports/admissions-trend?${toSearchParams(params)}`);
  return data.data.report;
}

export async function fetchRevenueReport(params = {}) {
  const { data } = await api.get(`/reports/revenue?${toSearchParams(params)}`);
  return data.data.report;
}

export async function fetchStudentEnrollmentReport(params = {}) {
  const { data } = await api.get(`/reports/student-enrollment?${toSearchParams(params)}`);
  return data.data.report;
}

export async function fetchEmployeeAttendanceReport(params = {}) {
  const { data } = await api.get(`/reports/employee-attendance?${toSearchParams(params)}`);
  return data.data.report;
}

export async function fetchPayrollSummaryReport(params = {}) {
  const { data } = await api.get(`/reports/payroll-summary?${toSearchParams(params)}`);
  return data.data.report;
}

// ============ EXPORT ENDPOINTS ============

export async function exportLeadConversionReport(params = {}) {
  const url = `/reports/lead-conversion/export?${toSearchParams(params)}`;
  window.location.href = `${api.defaults.baseURL}${url}`;
}

export async function exportAdmissionsTrendReport(params = {}) {
  const url = `/reports/admissions-trend/export?${toSearchParams(params)}`;
  window.location.href = `${api.defaults.baseURL}${url}`;
}

export async function exportRevenueReport(params = {}) {
  const url = `/reports/revenue/export?${toSearchParams(params)}`;
  window.location.href = `${api.defaults.baseURL}${url}`;
}

export async function exportStudentEnrollmentReport(params = {}) {
  const url = `/reports/student-enrollment/export?${toSearchParams(params)}`;
  window.location.href = `${api.defaults.baseURL}${url}`;
}

export async function exportEmployeeAttendanceReport(params = {}) {
  const url = `/reports/employee-attendance/export?${toSearchParams(params)}`;
  window.location.href = `${api.defaults.baseURL}${url}`;
}

export async function exportPayrollSummaryReport(params = {}) {
  const url = `/reports/payroll-summary/export?${toSearchParams(params)}`;
  window.location.href = `${api.defaults.baseURL}${url}`;
}
