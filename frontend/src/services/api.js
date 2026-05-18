import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true, // Crucial for sending cookies automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

// Global response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('role');
      // window.location.href = '/'; // Redirect if needed
    }
    return Promise.reject(error);
  }
);

export default api;