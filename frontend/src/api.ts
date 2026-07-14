import axios from 'axios';

export const API_URL = 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_URL,
});

// Her isteğe otomatik olarak Token ekler
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 Hatalarında (Oturum süresi dolduğunda) otomatik çıkış yap
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
