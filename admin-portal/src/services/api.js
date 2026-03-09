import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Dashboard / Analytics
export const getAnalyticsOverview = () => api.get('/analytics/overview');

// Users
export const getUsers = () => api.get('/users');
export const getUserById = (id) => api.get(`/users/${id}`);

// Providers
export const getProviders = () => api.get('/providers');
export const getProviderById = (id) => api.get(`/providers/${id}`);

// Jobs
export const getJobs = () => api.get('/jobs');
export const getJobById = (id) => api.get(`/jobs/${id}`);

// Payments
export const getPayments = () => api.get('/payments');

// Notifications
export const getNotifications = () => api.get('/notifications');

// Profile
export const getProfile = () => api.get('/profile');

export default api;
