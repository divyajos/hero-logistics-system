import apiClient from '../api/apiClient';

const accountsService = {
  getAccountsDashboard: async () => {
    const response = await apiClient.get('dashboard/accounts');
    return response.data;
  },

  addLedgerEntry: async (entryData) => {
    const response = await apiClient.post('ledgers', entryData);
    return response.data;
  },

  updateLedgerStatus: async (id, updateData) => {
    const response = await apiClient.put(`ledgers/${id}`, updateData);
    return response.data;
  },

  payPayrollRecord: async (id, updateData) => {
    const response = await apiClient.put(`payroll/pay/${id}`, updateData);
    return response.data;
  }
};

export default accountsService;
