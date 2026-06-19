import apiClient from '../api/apiClient';

const warehouseService = {
  getWarehouseDashboard: async () => {
    const response = await apiClient.get('dashboard/warehouse');
    return response.data;
  },

  addInventoryItem: async (itemData) => {
    const response = await apiClient.post('inventory', itemData);
    return response.data;
  },

  updateInventoryItem: async (id, updateData) => {
    const response = await apiClient.put(`inventory/${id}`, updateData);
    return response.data;
  },

  getInventoryMovements: async () => {
    const response = await apiClient.get('inventory/movements');
    return response.data;
  },

  getAssets: async () => {
    const response = await apiClient.get('assets');
    return response.data;
  }
};

export default warehouseService;
