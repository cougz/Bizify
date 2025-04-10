import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Get API URL from environment or use default
const API_URL = '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for handling errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/auth/token', { username: email, password }, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }),
  register: (name: string, email: string, password: string) => 
    api.post('/auth/register', { name, email, password }),
  getCurrentUser: () => api.get('/auth/me'),
};

// Customers API
export const customersAPI = {
  getAll: () => api.get('/customers'),
  getById: (id: string) => api.get(`/customers/${id}`),
  create: (data: any) => api.post('/customers', data),
  update: (id: string, data: any) => api.put(`/customers/${id}`, data),
  delete: (id: string) => api.delete(`/customers/${id}`),
  getStats: () => api.get('/customers/stats'),
};

// Invoices API
export const invoicesAPI = {
  getAll: () => api.get('/invoices'),
  getById: (id: string) => api.get(`/invoices/${id}`),
  create: (data: any) => api.post('/invoices', data),
  update: (id: string, data: any) => api.put(`/invoices/${id}`, data),
  delete: (id: string) => api.delete(`/invoices/${id}`),
  getStats: () => api.get('/invoices/stats'),
  getPdf: (id: string) => api.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),
};

// Dashboard API
export const dashboardAPI = {
  getData: () => api.get('/dashboard'),
};

// Settings API
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data: any) => api.put('/settings', data),
};

export default api;
