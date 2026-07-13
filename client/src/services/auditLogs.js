import api from './api';

const toSearchParams = (params) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value);
    }
  });
  return searchParams.toString();
};

export const listAuditLogs = async (params = {}) => {
  const query = toSearchParams(params);
  const { data } = await api.get(`/audit-logs?${query}`);
  return data;
};
