import api from './api.js';

export const ticketService = {
  createTicket: async (ticketData) => {
    const response = await api.post('/tickets', ticketData);
    return response.data;
  },

  getTickets: async () => {
    const response = await api.get('/tickets');
    return response.data;
  },

  getTicket: async (id) => {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  },

  updateTicket: async (id, ticketData) => {
    const response = await api.put(`/tickets/${id}`, ticketData);
    return response.data;
  },

  addComment: async (id, comment) => {
    const response = await api.post(`/tickets/${id}/comments`, { text: comment });
    return response.data;
  },

  escalateTicket: async (id, reason) => {
    const response = await api.post(`/tickets/${id}/escalate`, { reason });
    return response.data;
  },

  deleteTicket: async (id) => {
    const response = await api.delete(`/tickets/${id}`);
    return response.data;
  },

  getTicketWorkflow: async (id) => {
    const response = await api.get(`/tickets/${id}/workflow`);
    return response.data;
  },
};

