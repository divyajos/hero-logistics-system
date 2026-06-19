import apiClient from '../api/apiClient';

const driverService = {
  getDrivers: async () => {
    // In our mock, dispatch returns drivers count and lists, or we can resolve a general user role query
    const response = await apiClient.get('dashboard/dispatch');
    return response.data;
  },

  addDriver: async (driverData) => {
    const response = await apiClient.post('drivers', driverData);
    return response.data;
  },

  updateDriver: async (id, driverData) => {
    const response = await apiClient.put(`drivers/${id}`, driverData);
    return response.data;
  },

  deleteDriver: async (id) => {
    const response = await apiClient.delete(`drivers/${id}`);
    return response.data;
  }
};

export default driverService;
