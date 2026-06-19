import apiClient from '../api/apiClient';

const vehicleService = {
  getVehicles: async () => {
    const response = await apiClient.get('dashboard/company');
    return response.data?.fleet || [];
  },

  addVehicle: async (vehicleData) => {
    const response = await apiClient.post('fleet', vehicleData);
    return response.data;
  },

  updateVehicle: async (id, vehicleData) => {
    const response = await apiClient.put(`fleet/${id}`, vehicleData);
    return response.data;
  },

  deleteVehicle: async (id) => {
    const response = await apiClient.delete(`fleet/${id}`);
    return response.data;
  }
};

export default vehicleService;
