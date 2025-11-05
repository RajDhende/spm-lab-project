import api from './api.js';

export const dashboardService = {
  getDashboardStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  getAIStats: async () => {
    const response = await api.get('/ai/stats');
    return response.data;
  },
};

