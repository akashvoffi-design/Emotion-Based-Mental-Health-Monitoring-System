import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  signup: (name, email, password) => api.post('/api/auth/signup', { name, email, password }),
};

// Emotion API
export const emotionAPI = {
  detect: (imageBlob) => {
    const formData = new FormData();
    formData.append('image', imageBlob, 'capture.jpg');
    return api.post('/api/emotion/detect', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getHistory: (days = 7) => api.get(`/api/emotion/history?days=${days}`),
  getAnalytics: (days = 7) => api.get(`/api/emotion/analytics?days=${days}`),
};

export default api;
