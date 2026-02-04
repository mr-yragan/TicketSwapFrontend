import api from './axiosConfig.js';

export const purchaseApi = {
  createHold: async (listingId) => {
    try {
      const response = await api.post('/holds', { listingId });
      console.log('Ответ от сервера:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании hold:', error.response?.data || error.message);
      throw error;
    }
  },

  completeHold: async (holdId) => {
    const response = await api.post(`/holds/${holdId}/complete`);
    return response.data;
  },

  releaseHold: async (holdId) => {
    const response = await api.delete(`/holds/${holdId}`);
    return response.data;
  },

  getMyHolds: async () => {
    const response = await api.get('/me/holds');
    return response.data;
  },

  getMyPurchases: async (scope = 'active') => {
    const response = await api.get('/me/purchases', { params: { scope } });
    return response.data;
  }
};
