import axios from 'axios';

let accessToken = null;
let refreshPromise = null;

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
});

export function setAccessToken(token) {
  accessToken = token;
}

export function clearAccessToken() {
  accessToken = null;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isRefreshRequest = originalRequest?.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest?._retry && !isRefreshRequest) {
      originalRequest._retry = true;
      if (!refreshPromise) {
        refreshPromise = api.post('/auth/refresh')
          .then(({ data }) => {
            setAccessToken(data.data.accessToken);
            return data.data.accessToken;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const nextToken = await refreshPromise;
      originalRequest.headers.Authorization = `Bearer ${nextToken}`;
      return api(originalRequest);
    }
    return Promise.reject(error);
  },
);

export default api;