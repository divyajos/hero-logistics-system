import apiClient from '../api/apiClient';

const customerService = {
  getCustomerDashboard: async () => {
    // In our mock, customers can check their loads list
    const response = await apiClient.get('dashboard/dispatch');
    return response.data;
  },

  createBooking: async (bookingData) => {
    const response = await apiClient.post('loads', bookingData);
    return response.data;
  },

  getInstructions: async () => {
    const response = await apiClient.get('instructions');
    return response.data;
  },

  createInstruction: async (data) => {
    const response = await apiClient.post('instructions', data);
    return response.data;
  },

  updateInstruction: async (id, data) => {
    const response = await apiClient.put(`instructions/${id}`, data);
    return response.data;
  },

  deleteInstruction: async (id) => {
    const response = await apiClient.delete(`instructions/${id}`);
    return response.data;
  },

  getInvoices: async () => {
    const response = await apiClient.get('invoices');
    return response.data;
  },

  getTransactions: async () => {
    const response = await apiClient.get('transactions');
    return response.data;
  },

  payInvoice: async (id, payload) => {
    const response = await apiClient.put(`invoices/${id}/pay`, payload);
    return response.data;
  }
};

export default customerService;
