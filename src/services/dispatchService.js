import apiClient from '../api/apiClient';

const dispatchService = {
  getDispatchDashboard: async () => {
    const response = await apiClient.get('dashboard/dispatch');
    return response.data;
  },

  assignDriver: async (loadId, driverId) => {
    const response = await apiClient.post('dispatch/assign', { loadId, driverId });
    return response.data;
  },

  updateGisCoordinates: async (loadId, coordinates) => {
    const response = await apiClient.post('dispatch/gis', { loadId, coordinates });
    return response.data;
  }
};

export default dispatchService;
