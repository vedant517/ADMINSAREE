import axios from 'axios';
import { API_BASE_URL } from './apiConfig';
import { getStoredAuthToken } from '../utils/userSession';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {},
});

api.interceptors.request.use((config) => {
  const token = getStoredAuthToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isClearingSession = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isClearingSession) {
      isClearingSession = true;
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('role');
      import('../utils/userSession').then(({ clearUserSessionStorage }) => {
        clearUserSessionStorage();
        isClearingSession = false;
      });
    }
    return Promise.reject(error);
  }
);

export default api;
