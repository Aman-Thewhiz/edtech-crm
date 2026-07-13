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

export const listNotifications = async (params = {}) => {
  const query = toSearchParams(params);
  const { data } = await api.get(`/notifications?${query}`);
  return data;
};

export const markAsRead = async (id) => {
  const { data } = await api.post(`/notifications/${id}/mark-read`);
  return data.data;
};

export const markAllAsRead = async () => {
  const { data } = await api.post('/notifications/mark-all-read');
  return data.data;
};

export const deleteNotification = async (id) => {
  const { data } = await api.delete(`/notifications/${id}`);
  return data.data;
};

export const deleteAllNotifications = async () => {
  const { data } = await api.delete('/notifications');
  return data.data;
};

export const getPreferences = async () => {
  const { data } = await api.get('/notifications/preferences/me');
  return data.data;
};

export const updatePreferences = async (payload) => {
  const { data } = await api.put('/notifications/preferences/me', payload);
  return data.data;
};
