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

// Request interceptor for adding auth token and logging requests in development
api.interceptors.request.use(
  (config) => {
    // Add auth token to request if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) => {
    // Create form data for OAuth2 password flow
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    console.log('Logging in user:', { email });
    return axios.post(`${API_URL}/auth/token`, formData.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  },
  register: (name: string, email: string, password: string) => {
    console.log('Registering user:', { name, email, password });
    // Make sure we're using the full API URL
    return axios.post(`${API_URL}/auth/register`, { name, email, password }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },
  getCurrentUser: () => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },
  checkSetup: () => axios.get(`${API_URL}/auth/check-setup`),
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

// Invoices API - Fixed to properly handle data validation and date formats
export const invoicesAPI = {
  getAll: () => api.get('/invoices'),
  getById: (id: string) => api.get(`/invoices/${id}`),
  create: (data: any) => {
    // Format dates to ISO format with time component
    const formatDateToISO = (dateStr: string) => {
      if (!dateStr) return null;
      // Add time component (T00:00:00) to make it a valid ISO datetime
      return `${dateStr}T00:00:00`;
    };
    
    // Calculate discount from discount_percent if present
    let discount;
    if (data.discount_percent !== undefined) {
      // If we have both subtotal and discount_percent, calculate the absolute discount
      const subtotal = data.items?.reduce((sum: number, item: any) => 
        sum + (parseFloat(item.quantity) * parseFloat(item.unit_price)), 0) || 0;
      discount = subtotal * (parseFloat(data.discount_percent) / 100);
    }
    
    // Ensure the payload is properly formatted before sending
    const payload = {
      ...data,
      customer_id: parseInt(data.customer_id.toString(), 10),
      tax_rate: parseFloat(data.tax_rate?.toString() || '0'),
      discount: discount !== undefined ? discount : parseFloat(data.discount?.toString() || '0'),
      // Format dates to include time component
      issue_date: formatDateToISO(data.issue_date),
      due_date: formatDateToISO(data.due_date),
      items: data.items.map((item: any) => ({
        description: item.description,
        quantity: parseFloat(item.quantity.toString()),
        unit_price: parseFloat(item.unit_price.toString())
      }))
    };
    
    // Remove discount_percent as it's not expected by the backend
    if (payload.discount_percent !== undefined) {
      delete payload.discount_percent;
    }
    
    return api.post('/invoices', payload);
  },
  update: (id: string, data: any) => {
    // Format dates to ISO format with time component if they exist
    const formatDateToISO = (dateStr: string) => {
      if (!dateStr) return null;
      // Add time component (T00:00:00) to make it a valid ISO datetime
      return `${dateStr}T00:00:00`;
    };
    
    // Calculate discount from discount_percent if present
    let discount;
    if (data.discount_percent !== undefined) {
      // If we have both subtotal and discount_percent, calculate the absolute discount
      const subtotal = data.items?.reduce((sum: number, item: any) => 
        sum + (parseFloat(item.quantity) * parseFloat(item.unit_price)), 0) || 0;
      discount = subtotal * (parseFloat(data.discount_percent) / 100);
    }
    
    // Transform the data for the backend
    const payload = {
      ...data,
      // Format dates to include time component if they exist
      issue_date: data.issue_date ? formatDateToISO(data.issue_date) : undefined,
      due_date: data.due_date ? formatDateToISO(data.due_date) : undefined,
      // Convert discount_percent to discount if present
      discount: discount !== undefined ? discount : data.discount,
    };
    
    // Remove discount_percent as it's not expected by the backend
    if (payload.discount_percent !== undefined) {
      delete payload.discount_percent;
    }
    
    return api.put(`/invoices/${id}`, payload);
  },
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
