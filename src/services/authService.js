import apiClient from '../api/apiClient';

const authService = {
  login: async (email, password, role) => {
    const response = await apiClient.post('auth/login', { email, password, role });
    return response.data;
  },

  register: async (fullName, email, password, companyName) => {
    const response = await apiClient.post('auth/register', { fullName, email, password, companyName });
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('auth/logout');
    return response.data;
  },

  refresh: async () => {
    const response = await apiClient.post('auth/refresh');
    return response.data;
  },

  resetPassword: async (email) => {
    const response = await apiClient.post('auth/reset-password', { email });
    return response.data;
  }
};

export default authService;
