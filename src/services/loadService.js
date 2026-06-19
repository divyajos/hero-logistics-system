import apiClient from '../api/apiClient';

const loadService = {
  getLoadsDashboard: async () => {
    const response = await apiClient.get('dashboard/dispatch');
    return response.data;
  },

  createLoad: async (loadData) => {
    const response = await apiClient.post('loads', loadData);
    return response.data;
  },

  updateLoadStatus: async (id, updateData) => {
    const response = await apiClient.put(`loads/${id}`, updateData);
    return response.data;
  }
};

export default loadService;
