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

export async function markAttendance(payload) {
  const { data } = await api.post('/attendance', payload);
  return data.data.attendance;
}

export async function bulkMarkAttendance(payload) {
  const { data } = await api.post('/attendance/bulk', payload);
  return data.data;
}

export async function fetchAttendance(params = {}) {
  const { data } = await api.get(`/attendance?${toSearchParams(params)}`);
  return data;
}

export async function fetchAttendanceByEntity(entityType, entityId, params = {}) {
  const { data } = await api.get(`/attendance/${entityType}/${entityId}?${toSearchParams(params)}`);
  return data.data;
}

export async function fetchAttendanceSummary(entityType, entityId, month, year) {
  const { data } = await api.get(`/attendance/summary/${entityType}/${entityId}?month=${month}&year=${year}`);
  return data.data;
}

export async function updateAttendance(id, payload) {
  const { data } = await api.put(`/attendance/${id}`, payload);
  return data.data.attendance;
}

export async function deleteAttendance(id) {
  const { data } = await api.delete(`/attendance/${id}`);
  return data.data;
}

export async function createHoliday(payload) {
  const { data } = await api.post('/attendance/holidays/create', payload);
  return data.data.holiday;
}

export async function fetchHolidays(params = {}) {
  const { data } = await api.get(`/attendance/holidays/list?${toSearchParams(params)}`);
  return data;
}

export async function fetchHoliday(id) {
  const { data } = await api.get(`/attendance/holidays/${id}`);
  return data.data.holiday;
}

export async function updateHoliday(id, payload) {
  const { data } = await api.put(`/attendance/holidays/${id}`, payload);
  return data.data.holiday;
}

export async function deleteHoliday(id) {
  const { data } = await api.delete(`/attendance/holidays/${id}`);
  return data.data;
}

export async function fetchAttendanceStats(entityType) {
  const { data } = await api.get(`/attendance/stats/summary?entityType=${entityType}`);
  return data.data;
}
