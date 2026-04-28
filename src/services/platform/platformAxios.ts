// src/services/platform/platformAxios.ts
import axios from 'axios';

export const platformAxios = axios.create({
  baseURL: 'http://localhost:3001/platform',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Response interceptor for error handling
platformAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to console login if unauthorized
      window.location.href = '/console/login';
    }
    return Promise.reject(error);
  }
);
