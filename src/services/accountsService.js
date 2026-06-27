import apiClient from '../api/apiClient';

const accountsService = {
  getAccountsDashboard: async () => {
    const response = await apiClient.get('dashboard/accounts');
    return response.data;
  },
  
  executeAction: async (actionData) => {
    const response = await apiClient.post('accounts/action', actionData);
    return response.data;
  }
};

export default accountsService;