import apiClient from '../api/apiClient';

const companyService = {
  getDashboard: async () => {
    const response = await apiClient.get('dashboard/company');
    return response.data;
  },

  getSalesDashboard: async () => {
    const response = await apiClient.get('dashboard/sales');
    return response.data;
  },

  getTenants: async () => {
    const response = await apiClient.get('dashboard/super-admin');
    return response.data;
  },

  createTenant: async (tenantData) => {
    const response = await apiClient.post('tenants', tenantData);
    return response.data;
  },

  signupTrial: async (trialData) => {
    const response = await apiClient.post('company/trial', trialData);
    return response.data;
  }
};

export default companyService;
