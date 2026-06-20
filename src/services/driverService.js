import apiClient from '../api/apiClient';

const driverService = {
  getDrivers: async () => {
    const response = await apiClient.get('drivers');
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
