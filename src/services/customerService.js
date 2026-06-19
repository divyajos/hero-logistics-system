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
  }
};

export default customerService;
