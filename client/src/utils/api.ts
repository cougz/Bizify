import axios, { AxiosResponse, AxiosError } from 'axios';

// Get API URL from environment or use default
const API_URL = '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging requests in development
api.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error););
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

// Invoices API - Fixed to properly handle data validation
export const invoicesAPI = {
  getAll: () => api.get('/invoices'),
  getById: (id: string) => api.get(`/invoices/${id}`),
  create: (data: any) => {
    // Ensure the payload is properly formatted before sending
    const payload = {
      ...data,
      customer_id: parseInt(data.customer_id.toString(), 10),
      tax_rate: parseFloat(data.tax_rate?.toString() || '0'),
      discount: parseFloat(data.discount?.toString() || '0'),
      items: data.items.map((item: any) => ({
        description: item.description,
        quantity: parseFloat(item.quantity.toString()),
        unit_price: parseFloat(item.unit_price.toString())
      }))
    };
    return api.post('/invoices', payload);
  },
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

// Response interceptor for logging and handling errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', response.status, response.data);
    }
    return response;
  },
  (error: AxiosError) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    
    // If the error is a validation error (422), log the details for debugging
    if (error.response?.status === 422) {
      console.error('Validation Error Details:', error.response.data);
    }
    
    return Promise.reject(error