import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - обработка ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      localStorage.removeItem('userId');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  async register(email, password) {
    try {
      await apiClient.post('/auth/register', { email, password });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.fieldErrors
        ? Object.entries(error.response.data.fieldErrors)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join('; ')
        : error.response?.data?.message || error.message || 'Ошибка регистрации';
      return { success: false, error: message };
    }
  },

  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.fieldErrors
        ? Object.entries(error.response.data.fieldErrors)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join('; ')
        : error.response?.data?.message || error.message || 'Ошибка входа';
      return { success: false, error: message };
    }
  },
};
export const ticketsApi = {
  async getAll() {
    const response = await apiClient.get('/tickets');
    return response.data;
  },

  async getById(id) {
    const response = await apiClient.get(`/tickets/${id}`);
    return response.data;
  },

  async sell(ticketData) {
    const response = await apiClient.post('/tickets/sell', ticketData);
    return response.data;
  },

  async buy(id) {
    const response = await apiClient.post(`/tickets/${id}/buy`);
    return response.data;
  },
};


export const profileApi = {
  async getProfile() {
    const response = await apiClient.get('/me');
    return response.data;
  },

  async getMyListings() {
    const response = await apiClient.get('/me/listings');
    return response.data;
  },

  async getMyPurchases(scope = 'active') {
    const response = await apiClient.get('/me/purchases', { params: { scope } });
    return response.data;
  },

  async getMyHolds() {
    const response = await apiClient.get('/me/holds');
    return response.data;
  },
};

export default apiClient;
