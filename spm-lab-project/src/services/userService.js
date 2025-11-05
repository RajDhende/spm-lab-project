import api from './api.js';

export const userService = {
  list: async () => {
    const res = await api.get('/users');
    return res.data;
  },
  update: async (id, payload) => {
    const res = await api.put(`/users/${id}`, payload);
    return res.data;
  },
};


